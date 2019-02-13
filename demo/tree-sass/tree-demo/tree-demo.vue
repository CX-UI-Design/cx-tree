<template>
	<div class="demo_wrapper">
        <base-tree></base-tree>
    </div>  
</template>

<script>
import BaseTree from './base-tree';
export default{
    components:{
        BaseTree
    }
}
</script>

<style lang="scss">
    .demo_wrapper{
        width:500px;
        height:100%;
        border: 1px solid #333;
        box-sizing: border-box;
    }
</style>
