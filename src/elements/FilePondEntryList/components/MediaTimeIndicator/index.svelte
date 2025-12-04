<script lang="ts">
    interface MediaTimeIndicatorOptions {
        timeISO: string;
        timeLabel: string;
        durationISO: string;
        durationLabel: string;
    }

    let {
        timeISO = '0:00',
        timeLabel = '0:00',
        durationISO = '0S',
        durationLabel = '0:00',
    }: MediaTimeIndicatorOptions = $props();
</script>

<media-time-indicator>
    <time datetime={timeISO}>{timeLabel}</time> /
    <time datetime={durationISO}>{durationLabel}</time>
</media-time-indicator>
