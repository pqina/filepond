import { arrayRemoveInPlace } from '../utils/array.js';
import { noop } from '../utils/placeholder.js';
import { pubsub } from '../utils/pubsub.js';
import { isFunction, isString } from '../utils/test.js';

export interface TaskSchedulerOptions {
    log?: (tasks: Task[]) => void;
}

export interface TaskFnOptions {
    abortController: AbortController;
}

export type TaskFn = (...args: any[]) => Promise<void | boolean> | void | boolean;

export type TaskArgs = unknown[] | (() => unknown[]);

export interface Task {
    /** A function reference */
    fn: TaskFn;

    /** Parameters to pass to task function */
    params: TaskArgs;

    /** So we can abort tasks, or halt tasks belonging to the same group */
    group: string;

    /** How many of the `fn` can run in parallel */
    parallel: number;

    /** Order is used to sort this task in the queue */
    order: number;

    /** State of this task */
    state: number;

    /** Used to abort the task */
    abortController: AbortController;

    /** Run this task even when an earlier task has a soft failure (for example file failed to validate) */
    isOptional: boolean;
}

export interface TaskOptions {
    /** How many of these tasks can run in parallel */
    parallel?: number;

    /** Order is used to sort this task in the queue */
    order?: number;

    /** Parameters to pass to task function */
    params?: TaskArgs;

    /** Is this an optional task */
    isOptional?: boolean;
}

const TaskState = {
    QUEUED: 1,
    ACTIVE: 2,
    FAILED: 3,
    HALTED: 4,
};

export function createTaskScheduler(options: TaskSchedulerOptions) {
    const { log = undefined } = options ?? {};

    const { on, pub } = pubsub();

    const tasks: Task[] = [];

    /** This allows us to access tasks faster */
    const groupTasks: Map<string, Task[]> = new Map();

    function isRemainingTask(task: Task) {
        return task.state === TaskState.QUEUED || task.state === TaskState.ACTIVE;
    }

    function isQueuedTask(task: Task) {
        return task.state === TaskState.QUEUED;
    }

    function isActiveTask(task: Task) {
        return task.state === TaskState.ACTIVE;
    }

    function isValidTask(group: string, fn: TaskFn) {
        return isString(group) && isFunction(fn);
    }

    function insertTaskIntoTasks(task: Task, tasks: Task[]) {
        // insert into tasks based in task order
        let index = 0;
        for (let i = 0; i < tasks.length; i++) {
            if (task.order >= tasks[i].order) {
                index = i + 1;
            }
        }
        tasks.splice(index, 0, task);
    }

    function addTask(task: Task) {
        // insert into main tasks
        insertTaskIntoTasks(task, tasks);

        // add to grouped tasks
        let tasksInGroup = groupTasks.get(task.group);
        if (!tasksInGroup) {
            tasksInGroup = [];
            groupTasks.set(task.group, tasksInGroup);
        }
        insertTaskIntoTasks(task, tasksInGroup);
    }

    function hasTask(group: string, fn: TaskFn) {
        const tasksInGroup = groupTasks.get(group);
        return tasksInGroup ? !!tasksInGroup.find((task) => task.fn === fn) : false;
    }

    function removeTask(needle: Task) {
        arrayRemoveInPlace(
            tasks,
            (task: Task) => task.group === needle.group && task.fn === needle.fn
        );

        // clean up look up
        const tasksInGroup = groupTasks.get(needle.group);
        if (!tasksInGroup) {
            return;
        }

        arrayRemoveInPlace(tasksInGroup, (task: Task) => task.fn === needle.fn);
    }

    function removeTasksByGroup(group: string) {
        arrayRemoveInPlace(tasks, (task: Task) => task.group === group);

        // clean up lookup
        groupTasks.delete(group);
    }

    /**
     * This gets the tasks as assigned in the groupTasks Map, it's fast, but it's not guaranteerd
     * the tasks are sorted by order
     */
    function getTasksByGroup(group: string) {
        return groupTasks.get(group) ?? [];
    }

    function groupHasNextTaskWithState(group: string, state: number) {
        const nextTask = getTasksByGroup(group)[0];
        return nextTask.state === state;
    }

    function groupHasRemainingTasks(group: string) {
        return getTasksByGroup(group).filter(isRemainingTask).length > 0;
    }

    function abortTasksByGroup(group: string) {
        const groupTasks = getTasksByGroup(group);
        for (const task of groupTasks) {
            abort(task);
        }
    }

    function getNextTaskByGroup(group: string) {
        const queuedTasks = getTasksByGroup(group).filter(isQueuedTask);
        return queuedTasks[0];
    }

    function getTask(group: string, fn: TaskFn) {
        const groupTasks = getTasksByGroup(group);
        if (!groupTasks) {
            return;
        }

        return groupTasks.find((task) => task.fn === fn);
    }

    function setTaskStateByGroupId(
        group: string,
        newTaskState: number,
        options?: { ignoreOptional: boolean }
    ) {
        const { ignoreOptional = false } = options || {};
        const tasksInGroup = groupTasks.get(group) ?? [];
        for (const task of tasksInGroup) {
            if (ignoreOptional && task.isOptional) {
                continue;
            }
            task.state = newTaskState;
        }
    }

    function getTaskGroupsSortedByPriority() {
        return Array.from(new Set(tasks.map((task) => task.group)));
    }

    function getTaskGroupsUnsorted() {
        return groupTasks.keys();
    }

    function hasQueuedTasks() {
        return tasks.filter(isQueuedTask).length > 0;
    }

    function getActiveTasks() {
        return tasks.filter(isActiveTask);
    }

    function getActiveSimilarTasks(needle: Task) {
        return getActiveTasks().filter((activeTask) => activeTask.fn === needle.fn);
    }

    function canRunTask(task: Task) {
        // this isn't a task
        if (!task) {
            return false;
        }

        // we can run an infinite number of these tasks so let's go
        if (task.parallel === Infinity) {
            return true;
        }

        // this task can be run in parallel with similar tasks, let's see if the active task is a similar task and if we have room to spin up another one
        const activeSimilarTasks = getActiveSimilarTasks(task);

        // the amount of active similar tasks is smaller than the total number we can run, so let's go
        if (activeSimilarTasks.length < task.parallel) {
            return true;
        }

        return false;
    }

    function requestNextTask() {
        queueMicrotask(processNextTask);
    }

    function processNextTask() {
        // no more tasks to run
        if (!hasQueuedTasks()) {
            // so we can see what's going on
            log?.(tasks);
            pub('idle');
            return;
        }

        // so we can see what's going on
        log?.(tasks);

        // loop over groups
        const taskGroups = getTaskGroupsSortedByPriority();
        for (const group of taskGroups) {
            // group is busy with a task, or has no queued tasks (next task)
            if (!groupHasNextTaskWithState(group, TaskState.QUEUED)) {
                // if next task is halted, we test if there are any optional tasks we can move to the front
                if (groupHasNextTaskWithState(group, TaskState.HALTED)) {
                    const nextOptionalGroupTask = getNextTaskByGroup(group);
                    if (!nextOptionalGroupTask || !canRunTask(nextOptionalGroupTask)) {
                        continue;
                    }

                    runTask(nextOptionalGroupTask);
                }

                // skip to next group
                continue;
            }

            // get next task in this group
            const nextGroupTask = getNextTaskByGroup(group);

            // can't run this task, skip to next group
            if (!canRunTask(nextGroupTask)) {
                continue;
            }

            // run the task
            runTask(nextGroupTask);
        }
    }

    async function runTask(task: Task) {
        const { group, fn, params } = task;

        // now busy with this task
        task.state = TaskState.ACTIVE;

        // start task
        try {
            // get parameters for task
            const taskParameters = isFunction(params) ? params() : params;

            // task can return `false` to prevent running additional tasks (only optional tasks will run), task can throw error to halt all task processing
            const taskSuccess = await fn(...taskParameters, {
                abortController: task.abortController,
            });

            // done!
            removeTask(task);

            // task failed, we need to halt other tasks for this group
            if (taskSuccess === false) {
                setTaskStateByGroupId(group, TaskState.HALTED, { ignoreOptional: true });
            }
        } catch (error) {
            // mark task as failed
            task.state = TaskState.FAILED;

            // so others can handle it
            pub('error', error);

            // task failed, we need to halt other tasks for this group
            setTaskStateByGroupId(group, TaskState.HALTED);
        }

        // test if all tasks for this group have finished, if so remove all tasks for this group from the queue
        if (!groupHasRemainingTasks(group)) {
            pub('complete', group);
        }

        // done, try to run another task
        requestNextTask();
    }

    /** Runs the abort function on the task abort controller */
    function abort(task: Task) {
        // already aborted this controller
        if (task.abortController.signal.aborted) {
            return;
        }

        // let's abort!
        task.abortController.abort();
    }

    /** Add a new task */
    function pushTask(group: string, fn: TaskFn, options?: TaskOptions) {
        // set defaults
        const { parallel = Infinity, order = 0, params = [], isOptional = false } = options ?? {};

        // already has scheduled this task, this allows us to call pushTask multiple times without pushing the same tasks
        if (!isValidTask(group, fn) || hasTask(group, fn)) {
            return;
        }

        // add task to schedule
        addTask({
            group,
            fn,
            params,
            order,
            parallel,
            isOptional,
            state: TaskState.QUEUED,
            abortController: new AbortController(),
        });

        // done, try to run a task
        requestNextTask();
    }

    /** Abort a specific task */
    function abortTask(group: string, fn: TaskFn) {
        // abort this task
        const task = getTask(group, fn);
        if (!task) {
            return;
        }

        // abort the task
        abort(task);

        // done!
        removeTask(task);

        // done, try to run another task
        requestNextTask();
    }

    /** Abort All tasks in a group */
    function abortTasks(group?: string) {
        // no group supplied, let's abort tasks for every group
        if (!group) {
            for (const group of getTaskGroupsUnsorted()) {
                abortTasks(group);
            }
            return;
        }

        // abort all tasks in this group
        abortTasksByGroup(group);

        // remove tasks for this group
        removeTasksByGroup(group);

        // aborted all tasks with group id
        pub('abort', group);

        // no more tasks to run
        pub('complete', group);

        // done, try to run another task
        requestNextTask();
    }

    return {
        on,
        pushTask,
        abortTask,
        abortTasks,
    };
}
