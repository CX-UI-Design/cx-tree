<template>
    <div id="app">
        <treeDemo></treeDemo>
    </div>
</template>

<script>
    import treeDemo from './views/tree-demo'

    export default {
        name: 'app',
        components: {treeDemo},
        data() {
            return {}
        },
        created() {

        },
        methods: {}
    }
</script>

<style>
    #app {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
