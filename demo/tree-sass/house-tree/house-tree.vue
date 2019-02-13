<!--房产树-->
<template>
  <div>
    <!--树显示按钮-->
    <ns-icon-svg v-if="buttonShow" @click="treeshow" icon-class="hj" class="zhankai"></ns-icon-svg>
    <!--树区域-->
    <div v-if="treeisShow" class="tree-width house-tree" id="house_tree">
      <!--树隐藏按钮-->
      <ns-icon-svg v-if="buttonisShow" @click="treeisHide" icon-class="shouqi1" class="shouqi"></ns-icon-svg>
      <!--树搜索框-->
      <el-autocomplete v-model="treeInput" :fetch-suggestions="remoteSearch" value-key="houseFullName"
                       placeholder="快速查询" suffix-icon="el-icon-search" clearable size="small" @select="handleSelect"
                       @clear="handleSelect"></el-autocomplete>
      <!--树主体-->
      <div class="tree-body">
        <p class="treeTitle" ref="title">{{title}}</p>
        <sortable-tree v-loading="treeloading" element-loading-text="拼命加载中" :data="treeValue.treeData"
                       :parentArr="treeValue.treeData" childrenAttr="childOwnerHouseBaseInfoTreeNodeList"
                       :draggable="draggable"
                       @changePosition="changePosition" :dragEnable="true" closeStateKey="$foldClose">
          <!--树item-->
          <template slot-scope="{item, parent}">
            <div :class="{'activeDp': item.houseId === dpHouseId && dpVisible}">
              <!--item内容-->
              <div class="custom-tree-content clear" :title="item.houseName"
                   :class="{'exitChild': item.childOwnerHouseBaseInfoTreeNodeList && item.childOwnerHouseBaseInfoTreeNodeList.length,treeActive:item==objActive || item.houseId==initIndex}">
                <!-- [+] -->
                <img class="tree_node_img" src="../../../../assets/img/tree/zhankai.png" alt="zhankai"
                     v-if="(item['$foldClose'] === true && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'] && item.childOwnerHouseBaseInfoTreeNodeList.length === 0 )"
                     @click="changeState(item)">
                <!-- [-] -->
                <img class="tree_node_img" src="../../../../assets/img/tree/shousuo.png" alt="shousuo"
                     v-else-if="(item['$foldClose'] === undefined && item['isHasChild']) || (item['$foldClose'] === false && item['isHasChild'])"
                     @click="changeState(item)">
                <!-- [.] -->
                <img class="tree_node_img" src="../../../../assets/img/tree/bushenbuzhan1.png" alt="bushenbuzhan1"
                     v-else @click="changeState(item)">

                <!-- [+] -->
                <!--<ns-icon-svg class="tree_node_icon"-->
                <!--v-if="(item['$foldClose'] === true && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'] && item.childOwnerHouseBaseInfoTreeNodeList.length === 0 )"-->
                <!--@click="changeState(item)" icon-class="CombinedShapeCopy1"></ns-icon-svg>-->
                <!-- [-] -->
                <!--<ns-icon-svg class="tree_node_icon" v-else-if="(item['$foldClose'] === undefined && item['isHasChild']) || (item['$foldClose'] === false && item['isHasChild'])"-->
                <!--@click="changeState(item)" icon-class="CombinedShape1"></ns-icon-svg>-->
                <!-- [.] -->
                <!--<ns-icon-svg class="tree_node_icon" v-else @click="changeState(item)" icon-class="bushenbuzhan1"></ns-icon-svg>-->

                <span class="tree-text" v-if="item.companyName" @click="handleClick($event,item)"
                      :ref="item.houseId==0?'treeRoot':''">{{item.companyName}}</span>
                <span class="tree-text" v-else :id="item.houseId"
                      @click="handleClick($event,item)">{{item.houseName}}</span>
              </div>
              <!--item操作-->
              <el-dropdown class="fnsicon hide" trigger="click" :hide-on-click="true" v-if="showFunction"
                           @visible-change="handleDpVisibleChange">
							<span class="fnsicon_svg_span fnsicon_svgspan_hide" @click="handleDropdownClick(item)">
                <img class="tree_node_img_more" src="../../../../assets/img/tree/more@2x.png" alt="gengduo">
                <!--<ns-icon-svg icon-class="gengduo" class="tree_node_icon"></ns-icon-svg>-->
						  </span>
                <el-dropdown-menu slot="dropdown" class="tree-more-dropdown">
                  <el-dropdown-item @click.native="fnclick(item,item.houseType,'edit')" v-if="!isTreeRoot(item)">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item :disabled="hasChildNode(item)" v-if="!isTreeRoot(item)">
                    <el-popover placement="top" width="280" trigger="click">
                      <p>该{{deleteTip(item.houseType)}}删除后不可恢复，确定继续删除吗？</p>
                      <div class="prompt-delete">
                        <el-button class="delete-sure" type="primary" size="mini"
                                   @click.native="deleteDo(item, parent)">确 定
                        </el-button>
                        <el-button class="delete-cancel" size="mini" @click="cancel">取 消</el-button>
                      </div>
                      <div slot="reference">删除</div>
                    </el-popover>
                  </el-dropdown-item>

                  <template v-if="item.houseType!=='6' && item.houseType!=='8' && item.houseType!=='9'">
                    <el-dropdown-item :divided="!isTreeRoot(item)" disabled>
                      <p class="addChildre">新增子节点</p>
                    </el-dropdown-item>
                    <template v-if="item.houseType==='1'">
                      <el-dropdown-item @click.native="fnclick(item,2,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">项目</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="!item.houseType">
                      <el-dropdown-item @click.native="fnclick(item,1,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">区域</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,2,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">项目</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="item.houseType==='3'">
                      <el-dropdown-item @click.native="fnclick(item,4,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">楼栋</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,6,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">房产</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,7,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">车库</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,8,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">车位</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="item.houseType==='4'">
                      <el-dropdown-item @click.native="fnclick(item,5,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">单元</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,6,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">房产</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,8,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">车位</span>
                      </el-dropdown-item>
                      <!--<el-dropdown-item @click.native="fnclick(item,7,'add')">-->
                      <!--<ns-icon-svg icon-class="dian-copy"></ns-icon-svg>-->
                      <!--车库-->
                      <!--</el-dropdown-item>-->
                    </template>
                    <template v-else-if="item.houseType==='5'">
                      <el-dropdown-item @click.native="fnclick(item,6,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">房产</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,8,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">车位</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="item.houseType==='7'">
                      <el-dropdown-item @click.native="fnclick(item,8,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">车位</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else>
                      <el-dropdown-item @click.native="fnclick(item,3,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">组团</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,4,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">楼栋</span>
                      </el-dropdown-item>
                      <!--<el-dropdown-item @click.native="fnclick(item,5,'add')">-->
                      <!--<ns-icon-svg icon-class="dian-copy"></ns-icon-svg>-->
                      <!--单元-->
                      <!--</el-dropdown-item>-->
                      <el-dropdown-item @click.native="fnclick(item,6,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">房产</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,7,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">车库</span>
                      </el-dropdown-item>
                      <!--<el-dropdown-item @click.native="fnclick(item,8,'add')">-->
                      <!--<ns-icon-svg icon-class="dian-copy"></ns-icon-svg>-->
                      <!--车位-->
                      <!--</el-dropdown-item>-->
                      <el-dropdown-item @click.native="fnclick(item,9,'add')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        <span class="add-houseType">公共区域</span>
                      </el-dropdown-item>
                    </template>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </sortable-tree>
      </div>
      <!--房产树表单×9-->
      <!--1.区域表单-->
      <area-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.areaVisible"
                        v-if="dialogVisible.areaVisible.visible" :itemInfo="itemInfo" :type="operateType"
                        @query="gridAndTreeRefresh"></area-form-dialog>
      <!--2.项目表单-->
      <project-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.projectVisible"
                           v-if="dialogVisible.projectVisible.visible" :itemInfo="itemInfo"
                           :treeValue="treeValue" :type="operateType" @query="gridAndTreeRefresh"></project-form-dialog>
      <!--3.组团表单-->
      <cluster-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.clusterVisible"
                           v-if="dialogVisible.clusterVisible.visible" :itemInfo="itemInfo"
                           :type="operateType" @query="gridAndTreeRefresh"></cluster-form-dialog>
      <!--4.楼栋表单-->
      <building-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.buildingVisible"
                            v-if="dialogVisible.buildingVisible.visible" :itemInfo="itemInfo"
                            :type="operateType" @query="gridAndTreeRefresh"></building-form-dialog>
      <!--5.单元表单-->
      <unit-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.unitVisible"
                        v-if="dialogVisible.unitVisible.visible" :itemInfo="itemInfo" :type="operateType"
                        @query="gridAndTreeRefresh"></unit-form-dialog>
      <!--6.房间表单-->
      <room-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.roomVisible"
                        v-if="dialogVisible.roomVisible.visible" :itemInfo="itemInfo" :type="operateType"
                        @query="gridAndTreeRefresh"></room-form-dialog>
      <!--7.车库表单-->
      <garage-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.garageVisible"
                          v-if="dialogVisible.garageVisible.visible" :itemInfo="itemInfo"
                          :type="operateType" @query="gridAndTreeRefresh"></garage-form-dialog>
      <!--8.车位表单-->
      <carport-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.carportVisible"
                           v-if="dialogVisible.carportVisible.visible" :itemInfo="itemInfo"
                           :type="operateType" @query="gridAndTreeRefresh"></carport-form-dialog>
      <!--9.公共区域表单-->
      <publicArea-form-dialog @transferValue="transferValue" :dialogVisible="dialogVisible.publicAreaVisible"
                              v-if="dialogVisible.publicAreaVisible.visible" :itemInfo="itemInfo"
                              :type="operateType" @query="gridAndTreeRefresh"></publicArea-form-dialog>
    </div>
  </div>
</template>
<script>
  import {
    treeDataFetch,
    treeDataFetchForNoProject,
    treeDrag,
    treeOpen,
    getQrcode,
    getInputData,
    changeData,
    treeDelete,
    getForm,
    handleForm,
    detailForm,
    getDeveloper,
    fetchRelateData
  } from '@/api/owner/house-element-tree';
  import SortableTree from '../SortableTree.vue';
  import {
    AreaFormDialog,
    ProjectFormDialog,
    ClusterFormDialog,
    BuildingFormDialog,
    UnitFormDialog,
    GarageFormDialog,
    RoomFormDialog,
    CarportFormDialog,
    PublicAreaFormDialog
  } from './house-form-dialogs/index.js';

  export default {
    data() {
      return {
        operateType: '',
        itemInfo: {},
        buttonShow: false,
        buttonisShow: true,
        treeisShow: true,
        codeData: '', //二维码
        initIndex: 0,
        objActive: '', //是否选中
        treeNum: '',
        treeContent: '',
        oldtreeNum: '-1',
        showNum: -1,
        treeInput: '',
        searchTip: '搜索数据中...',
        //树数据
        treeValue: {
          //渲染数据
          treeData: {},
          //备份数据-用于返回上一状态
          saveValue: {}
        },
        treeData: {},
        isEdit: false, //是否编辑
        developerOptions: [],
        treeloading: true,
        developerloading: false,
        radio: '1',
        options: [],
        //dialog*9
        dialogVisible: {
          areaVisible: {visible: false}, //区域dialog显示判断条件
          projectVisible: {visible: false}, //项目dialog显示判断条件
          clusterVisible: {visible: false}, //组团dialog显示判断条件
          buildingVisible: {visible: false}, //楼栋dialog显示判断条件
          unitVisible: {visible: false}, //单元dialog显示判断条件
          roomVisible: {visible: false}, //房间dialog显示判断条件
          garageVisible: {visible: false}, //车库dialog显示判断条件
          carportVisible: {visible: false}, //车位dialog显示判断条件
          publicAreaVisible: {visible: false} //公共区域dialog显示判断条件
        },
        dpHouseId: '', //点击更多时 当前节点的houseId
        dpVisible: false, //dropdown visible
      };
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
          return {};
        }
      },
      treeType: {
        type: String
      },
      // 树的显示隐藏
      changeStatus: {
        type: Object,
        default() {
          return {};
        }
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
        this.changeStatus.status = false;
      },
      treeshow() {
        //显示
        this.treeisShow = true;
        this.buttonisShow = true;
        this.buttonShow = false;
        this.changeStatus.status = true;
        console.log(this.changeStatus);
      },
      //拖动树结构触发
      changePosition(opts) {
        let datas = {
          houseId: opts.data.houseId,
          parentId: opts.afterParent.houseId,
          sort: 0,
          sortHouseIdList: []
        };
        //得道插入后上一个元素的houseId sort
        for (
          let i = 0;
          i < opts.afterParent.childOwnerHouseBaseInfoTreeNodeList.length;
          i++
        ) {
          datas.sortHouseIdList.push(
            opts.afterParent.childOwnerHouseBaseInfoTreeNodeList[i].houseId
          );
          if (
            opts.afterParent.childOwnerHouseBaseInfoTreeNodeList[i].houseId ==
            opts.data.houseId &&
            i > 0
          ) {
            datas.sort =
              opts.afterParent.childOwnerHouseBaseInfoTreeNodeList[i - 1].houseId;
          }
        }
        treeDrag(datas)
          .then(r => {
            if (r.resultCode == '200') {
              //允许添加的情况
              //需要展开图标和切换icon
              if (
                opts.afterParent.childOwnerHouseBaseInfoTreeNodeList.length ==
                1 &&
                opts.afterParent.isHasChild
              ) {
                this.changeState(opts.afterParent, true);
              } else {
                opts.afterParent.isHasChild = true;
              }
              if (
                opts.beforeParent.childOwnerHouseBaseInfoTreeNodeList.length == 0
              ) {
                opts.beforeParent.isHasChild = false;
              }
              this.treeValue.saveValue = JSON.parse(
                JSON.stringify(this.treeValue.treeData)
              );
            } else {
              //不允许添加的情况，返回上一步树结构
              this.treeValue.treeData = JSON.parse(
                JSON.stringify(this.treeValue.saveValue)
              );
            }
          })
          .catch(r => {
            this.treeValue.treeData = JSON.parse(
              JSON.stringify(this.treeValue.saveValue)
            );
          });
      },
      //点击节点开关触发
      changeState(item, isbool) {
        if (isbool) {
          //拖动树节点时需要展开，触发
          treeOpen({
            houseId: item.houseId
          }).then(r => {
            this.$set(item, 'childOwnerHouseBaseInfoTreeNodeList', r.resultData);
            this.treeValue.saveValue = JSON.parse(
              JSON.stringify(this.treeValue.treeData)
            );
          });
        } else {
          if (
            item.isHasChild &&
            item.childOwnerHouseBaseInfoTreeNodeList.length == 0
          ) {
            //第一次打开节点加载数据
            return treeOpen({
              houseId: item.houseId
            }).then(r => {
              this.$set(
                item,
                'childOwnerHouseBaseInfoTreeNodeList',
                r.resultData
              );
              this.treeValue.saveValue = JSON.parse(
                JSON.stringify(this.treeValue.treeData)
              );
            });
          }
          this.$set(item, '$foldClose', !item['$foldClose']); //节点开关
        }
      },
      //树搜索输入触发查询
      remoteSearch(query, cb) {
        if (query !== '') {
          getInputData({
            houseName: query,
            houseType: 0
          })
            .then(r => {
              cb(r.resultData);
            })
            .catch(err => {
              this.searchTip = '服务器出错';
            });
        } else {
          cb([]);
        }
      },
      deleteTip(type) {
        //1.区域 2.项目 3.组团 4.楼栋 5.单元 6.房产 7.车库 8.车位 9.公共区域
        switch (type * 1) {
          case 1:
            return '区域';
          case 2:
            return '项目';
          case 3:
            return '组团';
          case 4:
            return '楼栋';
          case 5:
            return '单元';
          case 6:
            return '房产';
          case 7:
            return '车库';
          case 8:
            return '车位';
          case 9:
            return '公共区域';
          default:
            return '节点';
        }
      },
      //树节点操作
      fnclick(item, type, fnType) {
        this.itemInfo = item;
        this.operateType = fnType;
        switch (type * 1) {
          //1.区域 2.项目 3.组团 4.楼栋 5.单元 6.房产 7.车库 8.车位 9.公共区域 ,
          case 1:
            this.$set(this.dialogVisible.areaVisible, 'visible', true);
            break;
          case 2:
            this.$set(this.dialogVisible.projectVisible, 'visible', true);
            break;
          case 3:
            this.$set(this.dialogVisible.clusterVisible, 'visible', true);
            break;
          case 4:
            this.$set(this.dialogVisible.buildingVisible, 'visible', true);
            break;
          case 5:
            this.$set(this.dialogVisible.unitVisible, 'visible', true);
            break;
          case 6:
            this.$set(this.dialogVisible.roomVisible, 'visible', true);
            break;
          case 7:
            this.$set(this.dialogVisible.garageVisible, 'visible', true);
            break;
          case 8:
            this.$set(this.dialogVisible.carportVisible, 'visible', true);
            break;
          case 9:
            this.$set(this.dialogVisible.publicAreaVisible, 'visible', true);
            break;
        }
      },
      //删除节点
      deleteDo(item, parent) {
        let childrenArr = parent.childOwnerHouseBaseInfoTreeNodeList;
        this.$refs.title.click();
        treeDelete({
          houseId: item.houseId
        }).then(r => {
          let delIndex = childrenArr.findIndex(o => {
            return item.houseId === o.houseId;
          });
          childrenArr.splice(delIndex, 1);
          parent.isHasChild = !!childrenArr.length;
          this.$message({
            message: r.resultMsg,
            type: 'success'
          });
        });
      },
      //取消删除
      cancel() {
        this.$refs.title.click();
      },
      gridAndTreeRefresh() {
        this.treeDataHandle();
        this.$refs.treeRoot.click();
      },
      //树搜索条件变更
      handleSelect(item) {
        if (item) {
          changeData({
            houseId: item.houseId
          }).then(r => {
            this.treeValue.treeData = r.resultData;
            this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          });
        } else {
          this.treeDataHandle();
        }
      },
      dialogClose(formName) {
        //dialog关闭清空表单内容
        this.$refs[formName].resetFields();
      },
      //点击树节点
      handleClick(event, item) {
        // item.parentId==0?this.initIndex=item.houseId:this.initIndex=item.parentId;
        this.dpHouseId = '';
        this.objActive = item;
        this.initIndex = item.houseId;
        this.searchConditions.treeConditions = [
          {
            comparison: 'EQUAL',
            fieldName: 'houseId',
            fieldValue: item.houseId,
            type: 'text'
          }
        ];

        this.searchConditions.houseId = item.houseId;
        this.searchConditions.organizationId = item.organizationId;
        this.searchConditions.otherConditions.houseId = item.houseId;
        this.searchConditions.otherConditions.houseName = item.houseName ? item.houseName : item.companyName;
        this.searchConditions.mainSearch = '';
        this.searchConditions.pageNum = 1;
        this.$emit('handle-click');
        this.$emit('element-tree-item-click', item, this.treeValue.treeData);
      },
      //=====================================逻辑判断===================================//
      //判断是否为树的根节点--树的根节点houseId为0
      isTreeRoot(item) {
        if (item.houseId == 0) {
          return true;
        } else {
          return false;
        }
      },
      //判断是否存在子节点
      hasChildNode(item) {
        if (item.isHasChild) {
          return true;
        } else {
          return false;
        }
      },

      transferValue(item) {
        this.handleClick(event, item);
      },
      /**
       * handle dropdown click
       * @params item
       */
      handleDropdownClick(item) {
        this.dpHouseId = item.houseId;
      },
      /**
       * handle dropdown visible change
       * @params val
       */
      handleDpVisibleChange(val) {
        this.dpVisible = val;
      },
      //=====================================数据处理===================================//
      //树数据--处理
      treeDataHandle(isFirst) {
        this.treeloading = true;
        if (isFirst) {
          this.searchConditions.treeConditions = [
            {
              comparison: 'EQUAL',
              fieldName: 'houseId',
              fieldValue: '0',
              type: 'text'
            }
          ];
          this.searchConditions.houseId = 0;
          this.searchConditions.otherConditions.houseId = 0;
          // debugger
        }
        //树数据--请求
        if (this.treeType === 'noProject') {
          treeDataFetchForNoProject({}).then(r => {
            //树数据--更新数据
            this.treeValue.treeData = r.resultData;
            this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
            this.treeloading = false;

            //默认选中第一项
            // this.initIndex = 0;
          });
        } else {
          treeDataFetch({}).then(r => {
            //树数据--更新数据
            this.treeValue.treeData = r.resultData;
            this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
            this.treeloading = false;

            //默认选中第一项
            // this.initIndex = 0;
          });
        }
      },
      //=====================================初始化===================================//
      init() {
        //树数据--处理
        this.treeDataHandle(true);
      }
    },
    components: {
      [SortableTree.name]: SortableTree,
      AreaFormDialog,
      ProjectFormDialog,
      ClusterFormDialog,
      BuildingFormDialog,
      UnitFormDialog,
      GarageFormDialog,
      CarportFormDialog,
      PublicAreaFormDialog,
      RoomFormDialog
    },
    created() {
      this.init();
    },
    mounted() {
    }
  };
</script>
<style lang="scss" scoped>
  @import url("../../../../assets/css/Modular/tree/tree.scss");

  .el-popover {
    border-radius: 3px;
    color: #333333;
    border: 1px solid #dadada;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.22) !important;
    border-radius: 4px 4px 4px 0 0 0 4px;
  }
</style>
