<!--多选房产树-->
<template>
  <div class="el-house-tree-wrapper">
    <el-tree
      ref="houseTree"
      :data="treeBindData"
      :props="defaultProps"
      show-checkbox
      node-key="houseId"
      :default-expanded-keys="exbdKeys"
      :default-checked-keys="checkKeys"
      :load="loadNode"
      lazy
      :expand-on-click-node="false"
      @check-change="handleCheckChange">
    </el-tree>
  </div>
</template>

<script>
  import {treeDataFetch, changeData, treeOpen, detailForm} from "@/api/owner/house-element-tree";

  export default {
    props: {
      houseId: null,
      checkedList: {
        type: Array, default: function () {
          return [];
        }
      },
      condition: {
        type: Object, default: function () {
          return {};
        }
      }
    },
    data() {
      return {
        treeBindData: [],
        defaultProps: {
          children: "childOwnerHouseBaseInfoTreeNodeList",
          label: "houseName",
          isLeaf: "leaf"
        },
        exbdKeys: [0],
        checkKeys: [],
        checked: []
      };
    },
    model: {
      prop: 'checkedList',
      event: 'checked-list-change'
    },
    methods: {
      //select change event
      handleCheckChange(data, checked, indeterminate) {
        this.getCheckedNodes();
      },
      getCheckedNodes() {
        let checkedKeys = this.$refs.houseTree.getCheckedNodes();
        if (checkedKeys.length) {
          this.checked = checkedKeys.map((item) => {
            return {houseId: item.houseId, houseType: item.houseType};
          })
        } else {
          this.checked = [];
        }
        this.$emit('checked-list-change', this.checked);
      },
      // 加载节点方法
      loadNode(node, resolve) {
        if (node.level > 0) {
          let data = node.data;
          if (!data.childOwnerHouseBaseInfoTreeNodeList || data.childOwnerHouseBaseInfoTreeNodeList.length === 0) {
            treeOpen({
              houseId: data.houseId
            }).then(res => {
              resolve(res.resultData);
            })
          } else {
            // 默认展开
            this.handleKeyFers(data.childOwnerHouseBaseInfoTreeNodeList);
            resolve(data.childOwnerHouseBaseInfoTreeNodeList);
          }
        } else {
          return false;
        }
      },
      /**
       * 添加展开节点id函数
       * @method handleKeyFers
       * @param {Array} list 当前展开节点
       * @return
       */
      handleKeyFers(list) {
        for (let i = 0, val; val = list[i++];) {
          if (val.isHasChild && val.childOwnerHouseBaseInfoTreeNodeList.length > 0) {
            this.exbdKeys.push(val.houseId);
          }
        }
      },
    },
    created() {
      // 传入项目id(this.houseId)，加载树节点
      detailForm({houseId: this.houseId}).then(res => {
        let houseJson = JSON.parse(res.resultData.houseJson);
        this.treeBindData.push(houseJson);
      });
    }
  };
</script>
<style lang="scss">
  @import url("../../../../assets/css/Modular/tree/el-house-tree.scss");
</style>
