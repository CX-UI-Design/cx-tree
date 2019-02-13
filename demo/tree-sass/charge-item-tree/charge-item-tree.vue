<!--收费科目树-->
<template>
  <div>
    <!--树显示按钮-->
    <ns-icon-svg v-if="buttonShow" @click="treeshow" icon-class="hj" class="zhankai"></ns-icon-svg>
    <!--树区域-->
    <div v-if="treeisShow" class="tree-width house-tree" id="house_tree">
      <!--树搜索框-->
      <el-autocomplete v-model="treeInput" :fetch-suggestions="remoteSearch" value-key="chargeItemName" placeholder="快速查询" suffix-icon="el-icon-search" clearable size="small" @select="handleSelect" @clear="handleSelect"></el-autocomplete>
      <!--树主体-->
      <div class="tree-body">
        <p class="treeTitle" ref="title">{{title}}</p>
        <sortable-tree v-loading="treeloading" element-loading-text="拼命加载中" :data="treeValue.treeData" childrenAttr="childList" :draggable="draggable"
                       @changePosition="changePosition"
                       :dragEnable="true" closeStateKey="$foldClose">
          <!--树item-->
          <template slot-scope="{item}">
            <!--item内容-->
            <div class="custom-tree-content" :title="item.chargeItemName"
                 :class="{'exitChild': item.childList && item.childList.length,treeActive:item==objActive || item.id==initIndex}">
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

              <span class="tree-text" v-if="item.companyName" @click="handleClick($event,item)" :ref="item.id==0?'treeRoot':''">{{item.companyName}}</span>
              <span class="tree-text" v-else :id="item.id" @click="handleClick($event,item)">{{item.chargeItemName}}</span>

              <!-- [+] -->
              <!--<ns-icon-svg class="tree_node_icon" v-if="(item['$foldClose'] === true && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'] && item.childList.length === 0 )" @click="changeState(item)" icon-class="CombinedShapeCopy1"></ns-icon-svg>-->
              <!-- [-] -->
              <!--<ns-icon-svg class="tree_node_icon" v-else-if="(item['$foldClose'] === undefined && item['isHasChild']) || (item['$foldClose'] === false && item['isHasChild'])" @click="changeState(item)" icon-class="CombinedShape1"></ns-icon-svg>-->
              <!-- [.] -->
              <!--<ns-icon-svg class="tree_node_icon" v-else @click="changeState(item)" icon-class="bushenbuzhan1"></ns-icon-svg>-->
            </div>
          </template>
        </sortable-tree>
      </div>
    </div>
  </div>
</template>
<script>
  import {treeDataFetch, treeFilter} from '@/api/charge/charge-item-element-tree';
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
        options: [],
      }
    },
    props: {
      title: {
        type: String
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
      // 树的显示隐藏
      changeStatus: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    methods: {
      //=====================================触发方法===================================//
      //树显示隐藏
      treeisHide() { //隐藏
        this.treeisShow = false;
        this.buttonShow = true;
        this.buttonisShow = false
        this.changeStatus.status = false;
      },
      treeshow() { //显示
        this.treeisShow = true;
        this.buttonisShow = true;
        this.buttonShow = false;
        this.changeStatus.status = true;
      },
      //拖动树结构触发
      changePosition(opts) {
        let datas = {
          'id': opts.data.id,
          'parentId': opts.afterParent.id,
          'sort': 0,
          'sortidList': []
        }
        //得道插入后上一个元素的id sort
        for (let i = 0; i < opts.afterParent.childList.length; i++) {
          datas.sortidList.push(opts.afterParent.childList[i].id)
          if (opts.afterParent.childList[i].id == opts.data.id && i > 0) {
            datas.sort = opts.afterParent.childList[i - 1].id
          }
        }
      },
      //点击节点开关触发
      changeState(item, isbool) {
        if (isbool) { //拖动树节点时需要展开，触发
          treeDataFetch({
            id: item.id
          }).then((r) => {
            this.$set(item, 'childList', r.resultData.childList);
            this.treeValue.saveValue = JSON.parse(JSON.stringify(this.treeValue.treeData));
          })
        } else {
          if (item.isHasChild && item.childList.length == 0) { //第一次打开节点加载数据
            return treeDataFetch({
              id: item.id
            }).then((r) => {
              this.$set(item, 'childList', r.resultData.childList);
              this.treeValue.saveValue = JSON.parse(JSON.stringify(this.treeValue.treeData));
            });
          }
          this.$set(item, '$foldClose', !item['$foldClose']); //节点开关
        }
      },
      //树搜索输入触发查询
      remoteSearch(query, cb) {
        if (query !== '') {
          treeFilter({
            chargeItemCode: query,
          }).then((r) => {
            cb(r.resultData);
          }).catch((err) => {
            this.searchTip = "服务器出错";
          })
        } else {
          cb([]);
        }
      },
      //树搜索条件变更
      handleSelect(item) {
        if (item) {
          treeDataFetch({
            id: item.id
          }).then((r) => {
            this.treeValue.treeData = r.resultData;
            this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          })
        } else {
          this.treeDataHandle();
        }
      },
      //点击树节点
      handleClick(event, item) {
        this.objActive = item;
        this.initIndex = item.id;
        this.searchConditions.treeConditions = [{
          "comparison": "EQUAL",
          "fieldName": "id",
          "fieldValue": item.id,
          "type": "text"
        }];
        if (item.id) {
          this.searchConditions.id = item.id;
        }
        this.searchConditions.pageNum = 1;
        this.searchConditions.mainSearch = '';
        this.$emit('element-tree-item-click', item);
        this.$emit('handle-click');
      },
      //=====================================数据处理===================================//
      //树数据--处理
      treeDataHandle(isFirst) {
        this.treeloading = true;
        if (isFirst) {
          this.searchConditions.pageNum = 1;
          this.searchConditions.id = -1;
          this.searchConditions.houseId = 0;
          this.searchConditions.treeConditions = [{
            "comparison": "EQUAL",
            "fieldName": "id",
            "fieldValue": '-1',
            "type": "text"
          }];
        }
        //树数据--请求
        treeDataFetch({id: 0}).then((r) => {
          //树数据--更新数据
          this.treeValue.treeData = r.resultData;
          this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          this.treeloading = false;
          //默认选中第一项
          this.initIndex = -1;
        });
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
