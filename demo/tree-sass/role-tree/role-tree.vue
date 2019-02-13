<!--角色树-->
<template>
  <div>
    <!--树显示按钮-->
    <ns-icon-svg v-if="buttonShow" @click="treeshow" icon-class="hj" class="zhankai"></ns-icon-svg>
    <!--树区域-->
    <div v-if="treeisShow" class="tree-width house-tree" id="house_tree">
      <!--树搜索框-->
      <div v-if="queryAreaShow">
        <ns-icon-svg @mouseup.native.stop="" icon-class="sousuo" class="tree-search-icon tree_node_icon"></ns-icon-svg>
        <el-select size="small" v-model="treeInput" :clearable="true" @change="changeData" filterable remote
                   placeholder="请输入关键词" class="tree-search" :remote-method="remoteMethod" :loading="loading"
                   :loading-text="searchTip">
          <el-option v-for="item in options" :key="item.id" :label="item.chargeItemName" :value="item.id">
          </el-option>
        </el-select>
        <div class="tree-line"></div>
      </div>
      <!--树主体-->
      <div class="tree-body">
        <p class="treeTitle" ref="title">{{title}}</p>
        <sortable-tree v-loading="treeloading" element-loading-text="拼命加载中" :data="treeValue.treeData"
                       childrenAttr="childList" :draggable="draggable" @changePosition="changePosition"
                       :dragEnable="true" closeStateKey="$foldClose">
          <!--树item-->
          <template slot-scope="{item}">
            <!--item内容-->
            <div class="custom-tree-content" :title="111"
                 :class="{'exitChild': item.childList && item.childList.length,treeActive:item === objActive || item.id ===initIndex}">
              <!-- [+] -->
              <img class="tree_node_img" src="../../../../assets/img/tree/zhankai.png" alt="zhankai"
                   v-if="(item['$foldClose'] === true && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'] && item.childList.length === 0 )"
                   @click="changeState(item)">
              <!-- [-] -->
              <img class="tree_node_img" src="../../../../assets/img/tree/shousuo.png" alt="shousuo"
                   v-else-if="(item['$foldClose'] === undefined && item['isHasChild']) || (item['$foldClose'] === false && item['isHasChild'])"
                   @click="changeState(item)">
              <!-- [.] -->
              <img class="tree_node_img" src="../../../../assets/img/tree/bushenbuzhan1.png" alt="bushenbuzhan1" v-else @click="changeState(item)">

              <span class="tree-text" v-if="item.companyName" @click="handleClick($event, item)">{{item.companyName}}</span>
              <span class="tree-text" v-if="item.rolecategoryName && !item.rolename" @click="handleClick($event, item)">{{item.rolecategoryName}}</span>
              <span class="tree-text" v-if="item.rolename" @click="handleClick($event, item)">{{item.rolename}}</span>
              <span class="tree-text" v-if="item.userName" @click="handleClick($event, item)">{{item.userName}}</span>

              <!-- [+] -->
              <!--<ns-icon-svg class="tree_node_icon" v-if="(item['$foldClose'] === true && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'] && item.childList.length === 0 )" @click="changeState(item)" icon-class="CombinedShapeCopy1"></ns-icon-svg>-->
              <!-- [-] -->
              <!--<ns-icon-svg class="tree_node_icon" v-else-if="(item['$foldClose'] === undefined && item['isHasChild']) || (item['$foldClose'] === false && item['isHasChild'])" @click="changeState(item)" icon-class="CombinedShape1"></ns-icon-svg>-->
              <!-- [.] -->
              <!--<ns-icon-svg class="tree_node_icon" v-else @click="changeState(item)" icon-class="bushenbuzhan"></ns-icon-svg>-->


            </div>
          </template>
        </sortable-tree>
      </div>
    </div>
  </div>
</template>
<script>
  import {getRoleTree} from '@/api/role/role-element-tree-query';
  import SortableTree from '../SortableTree.vue';

  export default {
    data() {
      return {
        buttonShow: false,
        buttonisShow: true,
        treeisShow: true,
        initIndex: 0,
        objActive: '', //是否选中
        treeInput: "",
        searchTip: '搜索数据中...',
        //树数据
        treeValue: {
          //渲染数据
          treeData: {},
          //备份数据-用于返回上一状态
          saveValue: {}
        },
        treeData: {},
        treeloading: true,
        loading: false,
        options: [],
      }
    },
    computed: {
      'titleValue': function (item) {
        return item.companyName | item.rolecategoryName | item.rolename | item.userName
      }
    },
    props: {
      title: {
        type: String
      },
      queryAreaShow: {
        type: Boolean,
        default: false
      },
      draggable: {
        type: Boolean,
        default: false
      },
      //操作权限
      showFunction: {
        type: Boolean,
        default: false
      },
      searchConditions: {
        type: Object,
        default() {
          return {}
        }
      },
      startIndex: {
        type: Number,
        default: 0
      },
      endIndex: {
        type: Number
      }
    },
    methods: {
      treeisHide() { //隐藏
        this.treeisShow = false;
        this.buttonShow = true;
        this.buttonisShow = false

      },
      treeshow() { //显示
        this.treeisShow = true;
        this.buttonisShow = true;
        this.buttonShow = false;
      },
      //点击节点开关触发
      changeState(item, isbool) {
        if (item.isHasChild && item.childList.length === 0) {
          this.$set(item, 'childList', item.childList);
        }
        this.$set(item, '$foldClose', !item['$foldClose']); //节点开关
      },
      //树搜索条件变更
      changeData(val) {
        if (val) {
          getRoleTree().then((r) => {
            this.treeValue.treeData = r.resultData;
            this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          })
        } else {
          this.treeDataHandle();
        }
      },
      //点击树节点
      handleClick(event, item) {
        this.$emit('handle-click', item);
      },
      //=====================================数据处理===================================//
      //树数据--处理
      treeDataHandle(isFirst) {
        this.treeloading = true;
        //树数据--请求
        getRoleTree().then((r) => {
          //树数据--更新数据
          this.showTreeLevel(r.resultData, this.startIndex, this.endIndex);
          this.treeValue.treeData = r.resultData;
          this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          this.treeloading = false;
          //默认选中第一项
          this.initIndex = -1;
        });
      },
      changePosition() {

      },
      showTreeLevel(data, level, showLevel) {
        for (let item = 0; data.childList && item < data.childList.length; item++) {
          if (level === showLevel) {
            data.childList[item]['$foldClose'] = true;
            data.childList[item]['isHasChild'] = false;
          } else {
            this.showTreeLevel(data.childList[item], level + 1, showLevel);
          }
        }
      },
      //=====================================初始化===================================//
      init() {
        //树数据--处理
        this.treeDataHandle(true);
      },
    },
    components: {
      [SortableTree.name]: SortableTree,
    },
    created() {
      this.init();
    },
  }
</script>
<style>
  @import url("../../../../assets/css/Modular/tree/tree.scss");
</style>
