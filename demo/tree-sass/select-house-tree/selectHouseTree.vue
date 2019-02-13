<template>
  <ns-dialog id="nsSelectHousetree" :title="dialogTit" :visible.sync="dialogVisible" @close="dialogClose">
    <div class="ns-container-left" :id="noSearch" :class="{'ns-container-left-border': changeStatus.status}">
      <ns-house-tree :treeType="treeType" ref="house-tree" @tree-item-click="treeItemClick" :searchConditions='searchConditions' :changeStatus="changeStatus"></ns-house-tree>
    </div>
    <div slot="footer">
      <ns-button type="primary" @click="holdFormSubmit">确定</ns-button>
      <ns-button @click="holdFormCancel">取消</ns-button>
    </div>
  </ns-dialog>
</template>

<script>
  export default {
    name: 'ns-select-housetree',
    data() {
      return {
        houseTreeClickVal: {
          companyName: "绿城物业",
          houseId: "0",
          houseName: null,
          id: "0",
          isHasChild: true,
          organizationId: "3",
        },
        noSearch:"",
        changeStatus: {status: true}
      }
    },
    props: {
      treeType:{type:String,default:null},
      dialogTit:{type:String,default:"选择房产"},
      dialogVisible: {
        type: Object, default: function () {
          return {
            visible: true,
          }
        }
      },
    },
    methods: {
      //dialog相关操作
      dialogClose() {
        this.$set(this.dialogVisible, 'visible', false);//dialog关闭
      },
      //选择组织节点回调
      treeItemClick(org) {
        this.houseTreeClickVal = org;
      },
      holdFormSubmit() {
        if(this.houseTreeClickVal.houseId==="0" || this.treeType==="noProject"){
          this.houseTreeClickVal.houseType === "2"
            ?(this.$emit('treeClickVal', this.houseTreeClickVal),this.dialogClose())
            :this.$message({message: "请选择项目节点", type: "warning"});
        }else{
          this.$emit('treeClickVal', this.houseTreeClickVal);
          this.dialogClose();
        }
      },
      holdFormCancel() {
        this.dialogClose()
      },
    },
    created() {
      if(this.treeType==="noProject"){
        this.noSearch="noSearch"
      }
      this.searchConditions = this.search.conditions;
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss">
  #nsSelectHousetree{
    #house_tree{
      width: 100%;
    }
    .ns-svg-icon{
      display: none;
    }
    .el-input{
      width: 565px;
    }
    #noSearch .el-autocomplete{
      display: none;
    }
  }
</style>
