<script>
    import {ref} from "vue";
    export default {
        name: "GridScheduler",
        props: {
            items: Number,
        },
        methods: {
            getTime(i) {
                // Work out locale time from increment
                const totalMinutes = i * 5;
                const hour = Math.floor(totalMinutes / 60);
                const minute = (totalMinutes % 60).toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                });
                return `${hour}:${minute}`;
            },
            handleMouseDown(e, key) {
                this.dragging = true;
                if (key) {
                    this.highlight(key);
                }
                this.lastHighlighted = null;
            },
            handleMouseUp() {
                this.dragging = false;
                this.lastHighlighted = null;
            },
            handleMouseLeave() {
                this.dragging = false;
                this.lastHighlighted = null;
            },
            handleMouseOver(key) {
                if (this.dragging) {
                    this.highlight(key);
                }
            },
            async handleSubmit() {
                const body = JSON.stringify(this.highlighted);
                await fetch("/schedule", {
                    method: "POST",
                    body,
                    headers: {"Content-Type": "application/json"},
                });
            },
            async handleClear() {
                this.highlighted = {};
            },
            highlight(key) {
                const o = this.highlighted;
                const color = this.dragging;

                // Set color equal to whatever the first encounted color is, allowing for "painting"
                if (color && typeof color === "number") {
                    o[key] = color;
                } else if (color) {
                    const val = o[key];
                    if (val === undefined) {
                        o[key] = 1;
                    } else if (val > 8) {
                        delete o[key];
                    } else {
                        o[key] += 1;
                    }
                    this.dragging = o[key];
                }

                // Handle slow polling rate by filling in all squares between this one and the last one
                if (this.lastHighlighted) {
                    const [lastDay, lastMinute] = this.lastHighlighted.split("-").map(d => parseInt(d));
                    const [thisDay, thisMinute] = key.split("-").map(d => parseInt(d));

                    // For simplicity, we don't care about vertical movement, aka, filling in different days.
                    // All we're trying to do here is fill in the horizontal gaps.
                    if (lastDay === thisDay && Math.abs(lastMinute - thisMinute) > 1) {
                        const [start, end] =
                            lastMinute < thisMinute ? [lastMinute, thisMinute] : [thisMinute, lastMinute];
                        Array.from({length: end - start - 1}, (v, k) => k + start + 1).forEach(
                            d => (o[`${thisDay}-${d}`] = this.dragging)
                        );
                    }
                }

                this.lastHighlighted = key;
            },
        },
        data() {
            return {
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                minutes: (60 * 24) / 5,
                dragging: false,
            };
        },
        async setup() {
            const highlighted = ref({});
            const schedule = ref({});
            const json = await fetch("/schedule").then(response => response.json());
            highlighted.value = json.highlighted;
            schedule.value = json.segments;
            return {
                highlighted,
                schedule,
            };
        },
    };
</script>

<template>
    <div class="grid-schedule" @mousedown="handleMouseDown" @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
        <div class="grid-schedule-day">
            <label>&nbsp;</label>
            <div
                class="grid-schedule-header"
                v-for="minute in minutes"
                :key="`label-${minute}`"
                @mouseover="handleMouseOver(`${day}-${minute}`)"
            >
                {{ (minute * 5) % 60 === 0 ? getTime(minute) : "" }}
            </div>
        </div>
        <div class="grid-schedule-day" v-for="(str, day) in days" :key="day">
            <label>{{ str }}:</label>
            <div
                class="grid-schedule-minute"
                :class="
                    'color-' + (highlighted[`${day}-${minute}`] || 'none') + ((minute * 5) % 60 === 0 ? ' dark' : '')
                "
                v-for="minute in minutes"
                :key="minute"
                @mousedown.stop="handleMouseDown($event, `${day}-${minute}`)"
                @mouseover="handleMouseOver(`${day}-${minute}`)"
            ></div>
        </div>
        <button @click="handleClear">Clear Schedule</button>
        <button @click="handleSubmit">Save Schedule</button>
        <div class="grid-schedule-readout">
            <ul v-for="day in schedule" :key="`readout-day-${day}`">
                <li v-for="(item, idx) in day" :key="`readout-item-${idx}`">{{ item }}</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
    .grid-schedule {
        user-select: none;
    }
    .grid-schedule-day {
        display: flex;
        background: #fff;
        padding: 0 30px;
    }
    .grid-schedule-day label,
    .grid-schedule-header label {
        width: 100px;
        text-align: right;
        margin-right: 20px;
    }
    .grid-schedule-minute,
    .grid-schedule-header {
        width: 3px;
        height: 20px;
        background: #eee;
        margin: 0 1px 1px 0;
        flex: 1 1 0px;
    }
    .grid-schedule-header {
        background: none;
        transform: translateX(-15px);
    }
    .grid-schedule-readout ul {
        padding: 0;
        list-style: none;
    }
    .dark {
        filter: brightness(96%);
    }
    .color-1 {
        background: #ff6961;
    }
    .color-2 {
        background: #ffb480;
    }
    .color-3 {
        background: #f8f38d;
    }
    .color-4 {
        background: #42d6a4;
    }
    .color-5 {
        background: #08cad1;
    }
    .color-6 {
        background: #59adf6;
    }
    .color-7 {
        background: #9d94ff;
    }
    .color-8 {
        background: #c780e8;
    }
</style>
