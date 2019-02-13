<template>
  <div class="treeProgress">
    <ns-progress :percentage="percentage">
    </ns-progress>
    <span>{{now}}/{{all}}</span>
  </div>
</template>

<script>
  import ns from "@/utils/nsQuery/nsQuery";
  import * as store from "@/utils/nsQuery/nsStore";
  import resetData from "@/static-data/form/reset";
  import pickerOptionsMap from "@/static-data/form/picker-options";

  export default {
    props: {
      now: {
        type: Number,
        default: 0
      },
      all: {
        type: Number,
        default: 1
      },
      percentage: {
        type: Number,
        dafault: 0
      }
    },
    watch: {
      now: function (old) {
        this.percentage = Math.floor(this.now * 100 / this.all);
        console.log('----------------------------' + (Math.floor(this.now * 100 / this.all)))
      }
    },
    methods: {}
  };
</script>

<style rel="stylesheet/less" lang="scss">
  .treeProgress {
    position: relative;
    .el-progress-bar__outer {
      height: 6px;
      border-radius: 100px;
      background-color: #e4e8f1;
      overflow: hidden;
      position: relative;
      vertical-align: middle;
      width: 98%;
    }
    .el-progress__text {
      font-size: 14px;
      color: #48576a;
      display: none;
      vertical-align: middle;
      margin-left: 10px;
      line-height: 1;
    }
    span {
      font-size: 14px;
      color: #48576a;
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
      line-height: 1;
      position: absolute;
      top: 0px;
      right: 0;
      width: 10%;
    }
  }
</style>
