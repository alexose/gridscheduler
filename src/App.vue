<template>
    <h1>Vue GridScheduler</h1>
    <p>
        Inspired by the scheduler interface from uTorrent. Can be used to quickly build a weekly schedule along
        five-minute intervals.
    </p>
    <hr class="spacer" />
    <GridScheduler :items="8" />
</template>

<script>
    import GridScheduler from "./components/GridScheduler.vue";

    export default {
        name: "App",
        components: {
            GridScheduler,
        },
    };
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    hr.spacer {
        height: 60px;
        border: 0;
    }
</style>
