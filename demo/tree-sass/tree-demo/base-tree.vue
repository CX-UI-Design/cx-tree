<!--基础树-->
<template>
  <!--树显示按钮-->
  <!-- <ns-icon-svg v-if="buttonShow" @click="treeshow" icon-class="hj" class="zhankai"></ns-icon-svg> -->
  <!--树隐藏按钮-->
  <!-- <ns-icon-svg v-if="buttonisShow" @click="treeisHide" icon-class="shouqi1" class="shouqi"></ns-icon-svg> -->
  <!--树区域-->
  <div class="ns-tree-wrapper">
    <!--树搜索框-->
    <div class="ns-tree-search" v-if="isShowSearchInput">
      <ns-icon-svg @mouseup.native.stop="" icon-class="sousuo" class="tree-search-icon tree_node_icon"></ns-icon-svg>
      <el-select size="small" v-model="treeInput" :clearable="true" @change="changeData" filterable remote placeholder="请输入关键词" class="tree-search" :remote-method="remoteMethod"
                 :loading="loading" :loading-text="searchTip">
        <el-option v-for="(item,index) in options" :key="index" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
    </div>
    <!--树主体-->
    <div class="ns-tree-body">
      <p class="ns-tree-title" ref="title">title</p>
      <sortable-tree v-loading="treeloading" element-loading-text="拼命加载中" :data="treeData" childrenAttr="childrenlist" mixinParentKey="$parent" @changePosition="changePosition"
                     :dragEnable="true" closeStateKey="$foldClose">
        <!--树item-->
        <div slot-scope="{item}" class="ns-tree-item-wrapper">
          <!--节点开关-->
          <div class="ns-tree-switch fl" :title="item.name" :class="{'exitChild': item.childrenlist && item.childrenlist.length}">
            <!-- [+] -->
            <img class="tree_node_img" src="../../../../assets/img/tree/zhankai.png" alt="zhankai"
                 v-if="item['$foldClose'] && item.childrenlist && item.childrenlist.length || item.childrenlist && !item.childrenlist.length"
                 @click="changeState(item)">
            <!-- [-] -->
            <img class="tree_node_img" src="../../../../assets/img/tree/shousuo.png" alt="shousuo"
                 v-else-if="!item['$foldClose'] && item.childrenlist && item.childrenlist.length"
                 @click="changeState(item)">
            <!-- [.] -->
            <img class="tree_node_img" src="../../../../assets/img/tree/bushenbuzhan1.png" alt="bushenbuzhan1" v-else @click="changeState(item)">

            <!-- [+] -->
            <!--<ns-icon-svg class="tree_node_icon" v-if="item['$foldClose'] && item.childrenlist && item.childrenlist.length || item.childrenlist && !item.childrenlist.length" @click="changeState(item)" icon-class="CombinedShapeCopy1"></ns-icon-svg>-->
            <!-- [-] -->
            <!--<ns-icon-svg class="tree_node_icon" v-else-if="!item['$foldClose'] && item.childrenlist && item.childrenlist.length" icon-class="CombinedShape1" @click="changeState(item)" ></ns-icon-svg>-->
            <!-- [.] -->
            <!--<ns-icon-svg class="tree_node_icon" v-else  icon-class="bushenbuzhan1"></ns-icon-svg>-->

          </div>
          <!--item内容-->
          <div class="ns-tree-content fl" @click="handleClick(item)">{{item.name}}</div>
          <!--item操作-->
          <el-dropdown class="ns-tree-operate fr" trigger="click" :hide-on-click="true" v-if="showFunction">
            <div class="ns-tree-operate-icon">
              <ns-icon-svg icon-class="gengduo" @click="operate"></ns-icon-svg>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="fnclick(item,'edit')" v-if="!isTreeRoot(item)">
                编辑
              </el-dropdown-item>
              <el-dropdown-item :disabled="hasChildNode(item)" v-if="!isTreeRoot(item)">
                <el-popover placement="top" width="280" trigger="click">
                  <p>该节点删除后不可恢复，确定继续删除吗？</p>
                  <div class="prompt-delete">
                    <el-button class="delete-sure" type="primary" size="mini" @click.native="deleteDo(item)">确 定</el-button>
                    <el-button class="delete-cancel" size="mini" @click="cancel">取 消</el-button>
                  </div>
                  <div slot="reference">删除</div>
                </el-popover>
              </el-dropdown-item>

              <template v-if="hasChildNode(item)">
                <el-dropdown-item>
                  <p class="addChildre">新增子节点</p>
                </el-dropdown-item>
                <template>
                  <el-dropdown-item v-for="(n,index) in Inode" :key="index" @click.native="fnclick(item,index)">
                    <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                    {{n.name}}
                  </el-dropdown-item>
                </template>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </sortable-tree>
    </div>
    <slot name="form"></slot>
  </div>
</template>
<script>
  import SortableTree from "../SortableTree.vue";

  export default {
    data() {
      return {
        // 树隐藏显示控制数据
        draggable: true,
        buttonShow: false,
        buttonisShow: true,
        treeisShow: true,
        //树的搜索
        treeInput: ""
      };
    },
    props: {
      title: {
        type: String
      },
      treeData: {
        //树数据
        type: Object,
        default() {
          return {
            id: 0,
            name: "root",
            childrenlist: [
              {
                id: 1,
                name: "2",
                childrenlist: [
                  {id: 2, name: "2-1"},
                  {
                    id: 3,
                    name: "2-2",
                    childrenlist: []
                  }
                ]
              },
              {
                id: 4,
                name: "3",
                childrenlist: [{id: 5, name: "3-1"}, {id: 6, name: "3-2"}]
              }
            ]
          };
        }
      },
      treeloading: {
        //加载动画显隐
        type: Boolean,
        default: false
      },
      showFunction: {
        //操作按钮显隐
        type: Boolean,
        default: true
      },
      Inode: {
        //操作按钮对应显示节点信息
        type: Array,
        default: []
      },
      isShowSearchInput: {
        //搜索框的显隐
        type: Boolean,
        default: true
      },
      loading: {
        //搜索框加载显隐
        type: Boolean,
        default: false
      },
      searchTip: {
        //搜索框加载显示的文字
        type: String,
        default: "搜索数据中..."
      },
      options: {
        //select对应显示的数据
        type: Array,
        default: []
      }
    },
    methods: {
      //=====================================触发方法===================================//
      //树显示隐藏
      treeisHide() {
        //隐藏
        this.treeisShow = false;
        this.buttonShow = true;
        this.buttonisShow = false;
      },
      treeshow() {
        //显示
        this.treeisShow = true;
        this.buttonisShow = true;
        this.buttonShow = false;
      },
      changePosition(opts) {
        //节点拖动触发函数
        this.$emit("changePosition", opts);
      },
      changeState(item) {
        //点击节点左侧图标触发函数
        this.$emit("changeState", item);
      },
      handleClick(item) {
        //点击节点触发函数
        console.log(item);
        this.$emit("handleClick", item);
      },
      isTreeRoot(item) {
        //判断是否是跟节点
        if (item.id == 0) {
          return true;
        } else {
          return false;
        }
      },
      hasChildNode(item) {
        //判断有没有子节点
        if (item.childrenlist) {
          return true;
        } else {
          return false;
        }
      },
      //删除节点
      deleteDo(item) {
        this.$refs.title.click();
        this.$emit("deleteDo", item);
      },
      //取消删除
      cancel() {
        this.$refs.title.click();
      },
      fnclick(item, index) {
        //对节点进行操作时出发函数
        this.$emit("fnclick", item, index);
      },
      operate() {
        //点击操作图标时触发的函数
        this.$emit("operate");
      },
      changeData(val) {
        //select值改变的时候触发的函数
        this.$emit("changeData", val);
      },
      remoteMethod(query) {
        //搜索输入框值改变的时候触发的函数
        this.$emit("remoteMethod", query);
      }
    },
    components: {
      [SortableTree.name]: SortableTree
    }
  };
</script>
<style lang="scss">
  @import "./base-tree.scss";
</style>
<style lang="scss">
  // .el-popover {
  //   border-radius: 3px;
  //   color: #333333;
  //   border: 1px solid #dadada;
  //   box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.22) !important;
  //   border-radius: 4px 4px 4px 0 0 0 4px;
  // }
</style>
