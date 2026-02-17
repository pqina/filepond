import { it, describe, expect, beforeEach } from 'vitest';
import { createTaskScheduler } from '../../src/core/taskScheduler.js';

describe('taskScheduler', () => {
    /**
     * @type {{
     *     pushTask: FunctionPushTask;
     *     abortTask: FunctionAbortTask;
     *     abortTasks: FunctionAbortTasks;
     * }}
     */
    let scheduler;

    beforeEach(() => {
        scheduler = createTaskScheduler({
            log: false,
        });
    });

    it('should run task', () =>
        new Promise((done) => {
            scheduler.pushTask('entry-1', () => {
                done();
            });
        }));

    it('should run task with parameters', () =>
        new Promise((done) => {
            scheduler.pushTask(
                'entry-1',
                (a) => {
                    expect(a).to.be.equal('hello');
                    done();
                },
                {
                    params: ['hello'],
                }
            );
        }));

    it('should run task with parameters function', () =>
        new Promise((done) => {
            scheduler.pushTask(
                'entry-1',
                (a) => {
                    expect(a).to.be.equal('hello');
                    done();
                },
                {
                    params: () => ['hello'],
                }
            );
        }));

    it('should run tasks in sequence', () =>
        new Promise((done) => {
            let tasks = [];

            const task1 = () => {
                tasks.push(1);
            };

            const task2 = () => {
                tasks.push(2);
            };

            scheduler.pushTask('entry-1', task1);
            scheduler.pushTask('entry-1', task2);

            scheduler.on('complete', (group) => {
                expect(tasks[0]).to.equal(1);
                expect(tasks[1]).to.equal(2);
                done();
            });
        }));

    it('should not run same tasks', () =>
        new Promise((done) => {
            scheduler.on('error', done);

            let tasks = [];

            const task1 = () => {
                tasks.push(1);
            };

            const task2 = () => {
                tasks.push(2);
            };

            scheduler.pushTask('entry-1', task1);
            scheduler.pushTask('entry-1', task2);
            scheduler.pushTask('entry-1', task1);

            scheduler.on('complete', () => {
                expect(tasks[0]).to.equal(1);
                expect(tasks[1]).to.equal(2);
                done();
            });
        }));

    it('prevent run next task when a task returns false', () =>
        new Promise((done) => {
            let tasks = [];

            // will run
            const task1 = () => {
                tasks.push(1);
            };

            // prevents running next task
            const task2 = () => {
                tasks.push(2);
                return false;
            };

            // should not run
            const task3 = () => {
                tasks.push(3);
            };

            scheduler.pushTask('entry-1', task1);
            scheduler.pushTask('entry-1', task2);
            scheduler.pushTask('entry-1', task3);

            scheduler.on('complete', (groupId) => {
                expect(tasks[0]).to.equal(1);
                expect(tasks[1]).to.equal(2);
                expect(tasks[2]).to.equal(undefined);
                done();
            });
        }));

    it('prevent run next task when a task is aborted', () =>
        new Promise((done) => {
            scheduler.on('error', (err) => {
                done(err);
            });

            let tasks = [];

            // will run
            const task1 = () => {
                tasks.push(1);
            };

            // prevents running next task
            const task2 = () => {
                tasks.push(2);

                // stop next tasks
                scheduler.abortTasks('entry-1');
            };

            // should not run
            const task3 = () => {
                tasks.push(3);
            };

            scheduler.pushTask('entry-1', task1);
            scheduler.pushTask('entry-1', task2);
            scheduler.pushTask('entry-1', task3);

            const off = scheduler.on('complete', () => {
                off();

                expect(tasks[0]).to.equal(1);
                expect(tasks[1]).to.equal(2);
                expect(tasks[2]).to.equal(undefined);

                done();
            });
        }));

    it('should take task priority option into account', () =>
        new Promise((done) => {
            scheduler.on('error', done);

            let tasks = [];

            const task1 = () =>
                new Promise((resolve) => {
                    tasks.push(1);
                    resolve();
                });

            const task2 = () => {
                tasks.push(2);
            };

            const task3 = () => {
                tasks.push(3);
            };

            const task4 = () => {
                tasks.push(4);
            };

            const task5 = () => {
                tasks.push(5);
            };

            const task6 = () => {
                tasks.push(6);
            };

            scheduler.pushTask('entry-1', task1);
            scheduler.pushTask('entry-1', task2, { order: 4 });
            scheduler.pushTask('entry-1', task3, { order: 2 });
            scheduler.pushTask('entry-1', task4, { order: 2 });
            scheduler.pushTask('entry-1', task5);
            scheduler.pushTask('entry-1', task6, { order: 5 });

            scheduler.on('complete', () => {
                expect(tasks[0]).to.equal(1);
                expect(tasks[1]).to.equal(5);
                expect(tasks[2]).to.equal(3);
                expect(tasks[3]).to.equal(4);
                expect(tasks[4]).to.equal(2);
                expect(tasks[5]).to.equal(6);
                done();
            });
        }));

    it('should take task parallel option into account', () =>
        new Promise((done) => {
            scheduler.on('error', done);

            const task2duration = 30;

            let tasks = [];

            const task1 = () =>
                new Promise((resolve) => {
                    tasks.push(1);
                    resolve();
                });

            const task2 = () =>
                new Promise((resolve) => {
                    setTimeout(() => {
                        tasks.push(2);
                        resolve();
                    }, task2duration);
                });

            // should not run
            const task3 = () =>
                new Promise((resolve) => {
                    tasks.push(3);
                    resolve();
                });

            let now = Date.now();

            scheduler.pushTask('entry-1', task1);
            scheduler.pushTask('entry-1', task2, { parallel: 3 });
            scheduler.pushTask('entry-1', task3);

            scheduler.pushTask('entry-2', task1);
            scheduler.pushTask('entry-2', task2, { parallel: 3 });
            scheduler.pushTask('entry-2', task3);

            scheduler.pushTask('entry-3', task1);
            scheduler.pushTask('entry-3', task2, { parallel: 3 });
            scheduler.pushTask('entry-3', task3);

            scheduler.on('idle', () => {
                expect(tasks[0]).to.equal(1);
                expect(tasks[1]).to.equal(1);
                expect(tasks[2]).to.equal(1);
                expect(tasks[3]).to.equal(2);
                expect(tasks[4]).to.equal(3);
                expect(tasks[5]).to.equal(2);
                expect(tasks[6]).to.equal(3);
                expect(tasks[7]).to.equal(2);
                expect(tasks[8]).to.equal(3);

                // as we're running task2 in parallel the time it takes should be close to the timeout value in the task
                expect(Date.now() - now).to.be.closeTo(task2duration, 10);

                done();
            });
        }));
});
