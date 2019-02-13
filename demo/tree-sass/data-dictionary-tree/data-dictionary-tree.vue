<template>
  <div class="tree-width data-dictionary-tree">
    <div class="tree-body">
      <p class="treeTitle" ref="title">{{title}}</p>
      <sortable-tree v-loading="treeloading" element-loading-text="拼命加载中" :draggable="false" :data="treeValue.treeData" childrenAttr="children" mixinParentKey="$parent"
                     closeStateKey="$foldClose">
        <template slot-scope="{item}">
          <div :class="{'activeDp': item.nodeValue === dpNodeValue && dpVisible}">
            <!--item内容-->
            <div class="custom-tree-content" :class="{'exitChild': item.children && item.children.length != 0,treeActive:item === objActive || item.nodeValue == initIndex}">
              <!-- [+] -->
              <img class="tree_node_img" src="../../../../assets/img/tree/zhankai.png" alt="zhankai"
                   v-if="item['$foldClose'] && item.nodeType !== 'dic'" @click="changeState(item)">
              <!-- [.] -->
              <img class="tree_node_img" src="../../../../assets/img/tree/bushenbuzhan1.png" alt="bushenbuzhan1"
                   v-else-if="item.nodeType === 'dic'" @click="changeState(item)">
              <!-- [-] -->
              <img class="tree_node_img" src="../../../../assets/img/tree/shousuo.png" alt="shousuo" v-else @click="changeState(item)">

              <span class="tree-text" :id="item.nodeValue" @click="handleClick(item)">{{item.nodeName}}</span>

              <!-- [+] -->
              <!--<ns-icon-svg class="tree_node_icon" icon-class="CombinedShapeCopy1" v-if="item['$foldClose'] && item.nodeType !== 'dic'" @click="changeState(item)"></ns-icon-svg>-->
              <!-- [.] -->
              <!--<ns-icon-svg class="tree_node_icon" icon-class="bushenbuzhan1" v-else-if="item.nodeType === 'dic'" @click="changeState(item)"></ns-icon-svg>-->
              <!-- [-] -->
              <!--<ns-icon-svg class="tree_node_icon" icon-class="CombinedShape1" v-else @click="changeState(item)"></ns-icon-svg>-->

            </div>
            <el-dropdown class="fnsicon hide" trigger="click" :hide-on-click="true" v-if="showFunction" @visible-change="handleDpVisibleChange">
						<span class="fnsicon_svg_span fnsicon_svgspan_hide" @click="handleDropdownClick(item)">
              <img class="tree_node_img_more" src="../../../../assets/img/tree/more@2x.png" alt="gengduo" v-if="item.nodeType === 'dicGroup'|| item.organizationId !== 0">
						</span>
              <el-dropdown-menu slot="dropdown" class="tree-more-dropdown">
                <template v-if="item.nodeType === 'dic'">
                  <el-dropdown-item @click.native="treeEdit(item)">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="treeDelete(item)">
                    删除
                  </el-dropdown-item>
                </template>
                <template v-if="item.nodeType === 'dicGroup'">
                  <!--<el-dropdown-item divided>
                                          <p class="addChildre">新增子节点</p>
                                      </el-dropdown-item>-->
                  <el-dropdown-item @click.native="treeAdd(item)">
                    新增字典
                  </el-dropdown-item>
                </template>
                <el-dropdown-item v-if="item.nodeType === 'root'" @click.native="treeAdd(item)">
                  新增字典类型
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </sortable-tree>
    </div>
    <tree-dialog :visible="dialogObj.visible" :type="dialogObj.type" v-if="dialogObj.visible.visible" @query="getTreeData" :organizationId="organizationId"
                 :itemInfo="dialogObj.itemInfo" :detailInfo="dialogObj.detailInfo">
    </tree-dialog>
  </div>
</template>
<script>
  import {treeDataFetch, dicGroupDetailFetch, dicDictionaryFetch, deleteDictionaryFetch, deleteDictionaryGroupFetch} from '@/api/system/dictionary-element-tree'
  import SortableTree from '../SortableTree.vue'
  import TreeDialog from './tree-dialog.vue'

  export default {
    components: {
      [SortableTree.name]: SortableTree,
      TreeDialog,
    },
    data() {
      return {
        initIndex: 0,
        objActive: '', //是否选中
        loading: false,
        //树显示
        treeloading: true,
        //树数据
        treeValue: {
          //渲染数据
          treeData: {},
        },
        dialogObj: {
          visible: {
            visible: false
          },
          type: "",
          organizationId: this.organizationId,
          itemInfo: {},
          detailInfo: {}
        },
        dpNodeValue: '', //点击更多时 当前节点的nodeValue
        dpVisible: false, //dropdown visible
      }
    },
    props: {
      title: {
        type: String
      },
      searchConditions: {
        type: Object,
        default: function () {
          return {}
        }
      },
      draggable: {
        type: Boolean,
        default: false
      },
      showFunction: {
        type: Boolean,
        default: false
      },
      'show-checkBox': {
        type: Boolean
      },
      organizationId: {
        type: [Number, String]
      }
    },
    methods: {
      addDictionary(item) {

      },
      changeState(item, isDrag) { //==折叠展开操作
        this.$set(item, '$foldClose', !item['$foldClose'])
      },
      fnclick(item, orgType) { //新增功能
        //				this.$refs.title.click()
      },
      cancel() {
        //				this.$refs.title.click()
      },
      //树删除操作
      treeDelete(item) {
        if (item.organizationId == 0) {
          this.$message({
            message: "系统默认的不可删除",
            type: 'warning'
          });
          return false;
        }
        this.$confirm('确认删除?', {
          customClass: "el-message-box-oppositeBtns",
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (item.nodeType === "dicGroup") {
            deleteDictionaryGroupFetch({
              dictionaryGroupId: item.nodeValue
            }).then((r) => {
              this.$message({
                message: "删除成功",
                type: 'success'
              });
              this.getTreeData();
            }).catch((r) => {
              this.$message({
                message: r.data.resultMsg,
                type: 'warning'
              });
            })
          } else if (item.nodeType === "dic") {
            deleteDictionaryFetch({
              dictionaryId: item.nodeValue
            }).then((r) => {
              this.$message({
                message: "删除成功",
                type: 'success'
              });
              this.getTreeData();
            }).catch((r) => {
              this.$message({
                message: r.data.resultMsg,
                type: 'warning'
              });
            })
          }
        })
      },
      //树编辑
      treeEdit(item) {
        this.dialogObj.itemInfo = item;
        if (item.nodeType === "dicGroup") {
          this.dialogObj.type = "edit-group";
          dicGroupDetailFetch({
            dictionaryGroupId: item.nodeValue,
          }).then((r) => {
            if (r.resultData.organizationId == 0) {
              this.$message({
                message: '系统默认项不可编辑',
                type: 'warning'
              });
            } else {
              this.dialogObj.detailInfo = r.resultData;
              this.dialogObj.visible.visible = true;
            }
          })
          this.dialogObj.visible.visible = true;
        } else if (item.nodeType === "dic") {
          this.dialogObj.type = "edit-dic";
          dicDictionaryFetch({
            dictionaryId: item.nodeValue,
          }).then((r) => {
            if (r.resultData.organizationId == 0) {
              this.$message({
                message: '系统默认项不可编辑',
                type: 'warning'
              });
            } else {
              this.dialogObj.detailInfo = r.resultData;
              this.dialogObj.visible.visible = true;
            }
          })
        }
      },
      //树新增
      treeAdd(item) {
        this.dialogObj.itemInfo = item;
        if (item.nodeType === "root") {
          this.dialogObj.type = "add-group";
          this.dialogObj.visible.visible = true;
        } else if (item.nodeType === "dicGroup") {
          this.dialogObj.type = "add-dic";
          this.dialogObj.visible.visible = true;
        }
      },
      handleClick(item) {
        this.dpNodeValue = '';
        this.objActive = item;
        this.initIndex = item.nodeValue;
        this.index = item;
        if (item.nodeType === "dic") {
          this.searchConditions.organizationId = this.organizationId;
          this.searchConditions.dictionaryitemDictionaryId = item.nodeValue;
          this.searchConditions.dictionaryGroupId = "";
        } else if (item.nodeType === "dicGroup") {
          this.searchConditions.organizationId = this.organizationId;
          this.searchConditions.dictionaryitemDictionaryId = "";
          this.searchConditions.dictionaryGroupId = item.nodeValue;
        } else {
          this.searchConditions.organizationId = this.organizationId;
          this.searchConditions.dictionaryitemDictionaryId = "";
          this.searchConditions.dictionaryGroupId = "";
        }
        this.searchConditions.mainSearch = '';
        this.searchConditions.pageNum = 1;
        this.$emit('element-tree-item-click', item);
        this.$emit('handle-click');
      },
      /**
       * handle dropdown click
       * @params item
       */
      handleDropdownClick(item) {
        this.dpNodeValue = item.nodeValue;
      },
      /**
       * handle dropdown visible change
       * @params val
       */
      handleDpVisibleChange(val) {
        this.dpVisible = val;
      },
      getTreeData(isFirst) { //获取树数据
        this.treeloading = true;
        if (isFirst) {
          this.searchConditions.treeConditions = [{
            "comparison": "LIKE",
            "fieldName": "path",
            "fieldValue": '/',
            "type": "text"
          }];
        }
        treeDataFetch({
          organizationId: this.organizationId
        }).then((r) => {
          r.resultData.children.map((value, index) => {
            value['$foldClose'] = true;
            return value
          });
          // console.log(']]]]]]]]]]]]]]]]]]]]]]]]]]')
          // console.log(r.resultData)
          this.treeValue.treeData = r.resultData;
          this.defaultSelected(r);
          this.treeloading = false;
        })
      },
      /*
             *默认选中第一项
             * @params data object
             * */
      defaultSelected(data) {
        let idata = data.resultData;
        this.initIndex = idata.nodeValue;
        this.searchConditions.organizationId = this.organizationId;
        this.searchConditions.dictionaryitemDictionaryId = "";
        this.searchConditions.dictionaryGroupId = "";
//				this.$emit('element-tree-item-click', idata);
        this.$emit('handle-click', null, true);
//				if(idata.children.length > 0) {
//					for(let i = 0, val; val = idata.children[i]; i++) {
//						if(val.children.length > 0) {
//							this.initIndex = val.children[0].nodeValue;
//							this.searchConditions.organizationId = this.organizationId;
//							this.searchConditions.dictionaryitemDictionaryId = val.children[0].nodeValue;
//							let item = JSON.parse(JSON.stringify(val.children[0]));
//							item.$parent = val;
//							this.$emit('element-tree-item-click', item);
//							this.$emit('handle-click',null,true);
//							break;
//						}
//					}
//				}
      }
    },
    watch: {
      organizationId(val) {
        //树数据初始化?????????
        this.getTreeData(true);
      }
    },
    created() {
      if (this.organizationId != "") {
        //树数据初始化
        this.getTreeData(true);
      }
    }
  }
</script>
<style rel="stylesheet/less" lang="scss">
  .tree-width {
    .el-popover {
      min-width: 93px !important;
      border-radius: 3px;
      color: #333333 !important;
      border: 1px solid #dadada;
      box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.22) !important;
      border-radius: 4px 4px 4px 0 0 0 4px;
    }
    .ns-svg-icon {
      height: 14px;
      line-height: 15px;
    }
  }
</style>
<style scoped="">
  @import url("../../../../assets/css/Modular/tree/tree.scss");
</style>
