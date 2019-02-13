<!--选择房产项目-->
<template>
  <div class="ns-select-multi-house-tree clear">
    <ns-input v-model="selectPrecinctName" class="fl" readonly></ns-input>
    <a class="ns-select-multi-house-tree_lick fl txtC" @click="getDataFetch">请选择</a>
    <ns-dialog class="multiHouseTreeSelect" :title="dialogTit" :visible.sync="dialogVisible" size="small" @close="dialogClose">
      <el-tree
        :data="houseTreeArr"
        show-checkbox
        ref="tree"
        node-key="id"
        :default-expanded-keys="array"
        :props="defaultProps"
        :loading="loading"
      >
      </el-tree>
      <div slot="footer">
        <ns-button type="primary" size="small" @click.native="saveSelectData">保存</ns-button>
        <ns-button size="small" @click.native="dialogClose">取消</ns-button>
      </div>
    </ns-dialog>
  </div>
</template>
<script>
  import {treeDataFetch} from "@/api/owner/house-element-tree";

  export default {
    name: "selectMultiHouseTree",
    props: {
      dialogTit: {type: String},
      dialogVisible: {
        type: Object, default: function () {
          return {
            visible: false
          }
        }
      },
      fatherSelect: [Array]
    },
    model: {
      prop: 'fatherSelect',
      event: 'check-nodes'
    },
    data() {
      return {
        array: [],
        loading: false,
        houseTreeArr: [{
          childOwnerHouseBaseInfoTreeNodeList: [],
          houseId: null,
          houseName: null,
        }],
        defaultProps: {
          children: 'childOwnerHouseBaseInfoTreeNodeList',
          label: 'houseName'
        },
        selectPrecinctName: '', // 选择房产项目名称
      };
    },
    //初始化获取数据
    created() {
      // this.getDataFetch()
    },
    methods: {
      // 获取房产树
      getDataFetch() {
        this.loading = true;
        treeDataFetch({}).then(res => {
          this.loading = false;
          this.houseTreeArr[0].houseId = res.resultData.houseId;
          this.houseTreeArr[0].houseName = res.resultData.companyName;
          this.houseTreeArr[0].childOwnerHouseBaseInfoTreeNodeList = res.resultData.childOwnerHouseBaseInfoTreeNodeList;
          //默认展开项
          this.houseTreeArr[0].childOwnerHouseBaseInfoTreeNodeList.map(item => {
            this.array.push(item.id)
          });
        }).catch(() => {
          this.loading = false;
          console.log('error!')
        });
        this.dialogVisible.visible = true;
      },
      // 点击保存按钮，保存数据
      saveSelectData() {
        this.dataConversion();
        this.dialogClose()
      },
      //dialog相关操作
      dialogClose() {
        this.$set(this.dialogVisible, 'visible', false);//dialog关闭
      },
      // 处理数据格式
      dataConversion() {
        let houseNameArr = [];
        let precinctId = [];
        this.$refs.tree.getCheckedNodes().map(item => {
          if (item.childOwnerHouseBaseInfoTreeNodeList.length === 0) {
            houseNameArr.push(item.houseName);
            precinctId.push(item.houseId)
          }
        });
        this.selectPrecinctName = houseNameArr.toString();
        this.$emit('check-nodes', precinctId);
      }
    }
  }
</script>

<style scoped>
  .ns-select-multi-house-tree_lick {
    display: inline-block;
    width: 50px;
    height: inherit;
    line-height: inherit;
    cursor: pointer;
  }
</style>
