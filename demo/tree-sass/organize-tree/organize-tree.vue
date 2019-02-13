<template>
  <div>
    <!--树显示按钮-->
    <ns-icon-svg v-if="buttonShow" @click="treeshow" icon-class="hj" class="zhankai"></ns-icon-svg>
    <div v-if="treeisShow" class="tree-width">
      <!--树搜索框-->
      <el-autocomplete v-model="treeInput" :fetch-suggestions="remoteSearch" value-key="organizationName"
                       placeholder="快速查询" suffix-icon="el-icon-search" clearable size="small" @select="handleSelect"
                       @clear="handleSelect"></el-autocomplete>
      <!--树隐藏按钮-->
      <ns-icon-svg v-if="buttonisShow" @click="treeisHide" icon-class="shouqi1" class="shouqi"></ns-icon-svg>

      <!--树主体-->
      <div class="tree-body">
        <p class="treeTitle" ref="title">{{title}}</p>
        <sortable-tree v-loading="treeloading" element-loading-text="拼命加载中" :data="treeValue.treeData"
                       childrenAttr="childOrganizations" :draggable="draggable" mixinParentKey="$parent"
                       @changePosition="changePosition" :dragEnable="true" closeStateKey="$foldClose">
          <template slot-scope="{item}">
            <div :class="{'activeDp': item.organizationId === dpOrganizationId && dpVisible}">
              <!--item内容-->
              <div class="custom-tree-content"
                   :class="{'exitChild': item.childOrganizations && item.childOrganizations.length,treeActive:item===objActive || item.organizationId===initIndex}">
                <!-- [+] -->
                <img class="tree_node_img" src="../../../../assets/img/tree/zhankai.png" alt="zhankai"
                     v-if="(item['$foldClose'] && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'] && item.childOrganizations.length === 0)"
                     @click="changeState(item)">
                <!-- [-] -->
                <img class="tree_node_img" src="../../../../assets/img/tree/shousuo.png" alt="shousuo"
                     v-else-if="(!item['$foldClose'] && item['isHasChild']) || (item['$foldClose'] === undefined && item['isHasChild'])"
                     @click="changeState(item)">
                <!-- [.] -->
                <img class="tree_node_img" src="../../../../assets/img/tree/bushenbuzhan1.png" alt="bushenbuzhan1"
                     v-else @click="changeState(item)">

                <span class="tree-text" :id="item.organizationId"
                      @click="handleClick(item)">{{item.organizationName}}</span>

                <!-- [+] -->
                <!--<ns-icon-svg v-if="item['$foldClose'] &&  item['isHasChild'] && item.childOrganizations" @click="changeState(item)" icon-class="CombinedShapeCopy1" class="tree_node_icon"></ns-icon-svg>-->
                <!-- [-] -->
                <!--<ns-icon-svg v-else-if="!item['$foldClose'] && item['isHasChild'] && item.childOrganizations.length" @click="changeState(item)" icon-class="CombinedShape1" class="tree_node_icon"></ns-icon-svg>-->
                <!-- [.] -->
                <!--<ns-icon-svg v-else @click="changeState(item)" icon-class="bushenbuzhan1" class="tree_node_icon"></ns-icon-svg>-->

              </div>
              <el-dropdown class="fnsicon hide" trigger="click" :hide-on-click="true" v-if="showFunction"
                           @visible-change="handleDpVisibleChange">
							<span class="fnsicon_svg_span fnsicon_svgspan_hide" @click="handleDropdownClick(item)">
                <img class="tree_node_img_more" src="../../../../assets/img/tree/more@2x.png" alt="gengduo">
							</span>
                <el-dropdown-menu slot="dropdown" class="tree-more-dropdown">
                  <el-dropdown-item @click.native="treeEdit(item)">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item v-if="item.isHasChild==false">
                    <el-popover placement="top" width="280" trigger="click">
                      <p>"{{item.organizationShortName}}"&nbsp;删除后不可恢复，确定继续删除吗？</p>
                      <div class="prompt-delete">
                        <el-button class="delete-sure" type="primary" size="mini" @click.native="treeDelete(item)">确 定
                        </el-button>
                        <el-button class="delete-cancel" size="mini" @click="cancel">取 消</el-button>
                      </div>
                      <div slot="reference">删除</div>
                    </el-popover>
                  </el-dropdown-item>
                  <template>
                    <el-dropdown-item divided disabled>
                      <p class="addChildre">新增子节点</p>
                    </el-dropdown-item>
                    <template v-if="item.organizationType==0||item.organizationType==1">
                      <el-dropdown-item @click.native="fnclick(item,'company')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        新建子公司
                      </el-dropdown-item>
                      <el-dropdown-item @click.native="fnclick(item,'department')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        新建部门
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="item.organizationType!==0&&item.organizationType!==1">
                      <el-dropdown-item @click.native="fnclick(item,'department')">
                        <ns-icon-svg icon-class="dian-copy"></ns-icon-svg>
                        新建子部门
                      </el-dropdown-item>
                    </template>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </sortable-tree>
      </div>
      <!--新建编辑子公司-->
      <add-or-edit-company v-if="dialogVisible.companyVisible.visible" :companyVisible="dialogVisible.companyVisible"
                           :type="companyDialogObj.type"
                           :nodeInfo="companyDialogObj.nodeInfo" :parentNodeInfo="companyDialogObj.parentNodeInfo"
                           @query="getTreeData"></add-or-edit-company>
      <!--部门编辑弹出框-->
      <add-or-edit-department v-if="dialogVisible.departmentVisible.visible" :visible="dialogVisible.departmentVisible"
                              :type="departmentDialogObj.type"
                              :nodeInfo="departmentDialogObj.nodeInfo"
                              :parentNodeInfo="departmentDialogObj.parentNodeInfo"
                              @query="getTreeData"></add-or-edit-department>
      <!-- 集团弹窗 -->
      <group-Dialog v-if="dialogVisible.groupVisible.visible" :visible="dialogVisible.groupVisible"
                    :nodeInfo="groupDialogObj.nodeInfo" @query="refreshTreeData"/>
    </div>
  </div>
</template>
<script>
  import {
    treeCompanyOpen,
    treeDepartmentOpen,
    changeData,
    getInputData,
    treeOpen,
    treeDrag,
    treeDataFetch,
    companyEdit,
    departmentAdd,
    departmentEdit,
    companyDetail,
    departmentDetail,
    companyDelete,
    departmentDelete
  } from '@/api/system/organize-element-tree';
  import SortableTree from '../SortableTree.vue';
  import addOrEditCompany from './organize-dialogs/company.vue';
  import addOrEditDepartment from './organize-dialogs/department.vue';
  import groupDialog from './organize-dialogs/group.vue';

  export default {
    components: {
      SortableTree,
      addOrEditCompany,
      addOrEditDepartment,
      groupDialog
    },
    data() {
      return {
        buttonShow: false,
        buttonisShow: true,
        treeisShow: true,
        initIndex: 0,
        objActive: '', //是否选中
        //部门节点信息
        departmentOptions: [
          {
            //部门类型
            label: '服务中心',
            value: 0
          },
          {
            label: '职能中心',
            value: 1
          }
        ],
        dialogVisible: {
          groupVisible: {visible: false},
          companyVisible: {visible: false},
          departmentVisible: {visible: false}
        },
        groupDialogObj: {
          nodeInfo: {}
        },
        //公司dialog信息
        companyDialogObj: {
          type: '',
          parentNodeInfo: {
            organizationName: '',
            organizationId: ''
          },
          nodeInfo: {}
        },
        //部门dialog信息
        departmentDialogObj: {
          type: '',
          parentNodeInfo: {
            organizationName: '',
            organizationId: ''
          },
          nodeInfo: {}
        },
        searchTip: '搜索数据中...',
        loading: false,
        options: [],
        //树显示
        treeNum: '',
        treeContent: '',
        oldtreeNum: '-1',
        showNum: -1,
        index: 1,
        treeInput: '',
        treeloading: true,

        //树数据
        treeValue: {
          //渲染数据
          treeData: {},
          //备份数据-用于返回上一状态
          saveValue: {}
        },
        dpOrganizationId: '', //点击更多时 当前节点的organizationId
        dpVisible: false, //dropdown visible
      };
    },
    props: {
      title: {
        type: String
      },
      searchConditions: {
        type: Object,
        default() {
          return {};
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
      orgTypeFilter: null,
      // 树的显示隐藏
      changeStatus: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    methods: {
      refreshTreeData() {
        this.getTreeData(true);
      },
      checked(scope) {
        if (
          $('#' + scope.idTree)
            .closest('.custom-element-tree-content')
            .find('.bool-checked')
            .hasClass('is-checked')
        ) {
          $('#' + scope.idTree)
            .closest('.sortable-element-tree')
            .find('.bool-checked')
            .removeClass('is-checked');
        } else {
          $('#' + scope.idTree)
            .closest('.sortable-element-tree')
            .find('.bool-checked')
            .addClass('is-checked');
        }
        if (scope.$parent) {
          $('.blank-li .el-checkbox__input').removeClass('is-checked');
          $('.blank-li .el-checkbox__input').removeClass('bool-checked');
          var objScope = scope.$parent;
          while (objScope) {
            if (
              $("#" + objScope.idTree)
                .closest(".sortable-element-tree")
                .find("ul .is-checked").length ==
              $("#" + objScope.idTree)
                .closest(".sortable-element-tree")
                .find("ul .bool-checked").length
            ) {
              $('#' + objScope.idTree)
                .closest('.custom-element-tree-content')
                .find('.bool-checked')
                .addClass('is-checked');
            } else {
              $('#' + objScope.idTree)
                .closest('.custom-element-tree-content')
                .find('.bool-checked')
                .removeClass('is-checked');
            }
            objScope = objScope.$parent;
          }
        }
      },

      //树显示隐藏
      treeisHide() {
        //隐藏
        this.treeisShow = false;
        this.buttonShow = true;
        this.buttonisShow = false;
        this.changeStatus.status = false;
      },
      //树显示
      treeshow() {
        this.treeisShow = true;
        this.buttonisShow = true;
        this.buttonShow = false;
        this.changeStatus.status = true;
      },
      //樹搜索
      handleSelect(item) {
        if (item) {
          changeData({
            organizationId: item.organizationId
          }).then(r => {
            this.treeValue.treeData = r.resultData;
            this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          });
        } else {
          this.treeDataHandle();
        }
      },
      //树搜索输入触发查询
      remoteSearch(query, cb) {
        if (query !== '') {
          getInputData({
            organizationName: query
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

      //拖动树结构触发
      changePosition(opts) {
        let datas = {
          organizationId: opts.data.organizationId,
          organizationParentId: opts.afterParent.organizationId,
          sort: 0,
          sortOrganizationIds: []
        };
        //得道插入后上一个元素的organizationId sort
        for (let i = 0; i < opts.afterParent.childOrganizations.length; i++) {
          datas.sortOrganizationIds.push(
            opts.afterParent.childOrganizations[i].organizationId
          );
          if (
            opts.afterParent.childOrganizations[i].organizationId ===
            opts.data.organizationId &&
            i > 0
          ) {
            datas.sort =
              opts.afterParent.childOrganizations[i - 1].organizationId;
          }
        }
        treeDrag(datas).then(r => {
          if (r.resultData.result) {
            //允许添加的情况
            //需要展开图标和切换icon
            if (
              opts.afterParent.childOrganizations.length === 1 &&
              opts.afterParent.isHasChild
            ) {
              this.changeState(opts.afterParent, true);
            } else {
              opts.afterParent.isHasChild = true;
            }
            if (opts.beforeParent.childOrganizations.length === 0) {
              opts.beforeParent.isHasChild = false;
            }
            this.treeValue.saveValue = JSON.parse(
              JSON.stringify(this.treeValue.treeData)
            );
          } else {
            //不允许添加的情况，返回上一步树结构
            this.treeValue.treeData = this.treeValue.saveValue;
            this.$message({
              message: r.resultData.message,
              type: 'warning'
            });
          }
        });
      },
      treeDataHandle(isFirst) {
        //==树数据处理
        this.treeloading = true;
        if (isFirst) {
          this.searchConditions.treeConditions = [
            {
              comparison: 'LIKE',
              fieldName: 'path',
              fieldValue: '/',
              type: 'text'
            }
          ];
        }
        const query = {};
        if (this.orgTypeFilter) {
          Object.assign(query, {orgType: this.orgTypeFilter});
        }
        //树数据--请求
        treeDataFetch(query).then(r => {
          //树数据--更新数据
          this.treeValue.treeData = r.resultData;
          this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          this.treeloading = false;
        });
      },
      //折叠展开操作
      changeState(item, isDrag) {
        if (isDrag) {
          //拖动树节点时需要展开，触发
          treeOpen({
            organizationId: item.organizationId
          }).then(r => {
            this.$set(item, 'childOrganizations', r.resultData);
            this.treeValue.saveValue = JSON.parse(
              JSON.stringify(this.treeValue.treeData)
            );
          });
        } else {
          if (item.isHasChild && item.childOrganizations.length == 0) {
            //请求条件
            const query = {organizationId: item.organizationId};
            if (this.orgTypeFilter) {
              Object.assign(query, {orgType: this.orgTypeFilter});
            }

            if (item.organizationType !== 0 && item.organizationType !== 1) {
              treeDepartmentOpen(query).then(r => {
                this.$set(item, 'childOrganizations', r.resultData);
                this.treeValue.saveValue = JSON.parse(
                  JSON.stringify(this.treeValue.treeData)
                );
              });
            } else {
              treeCompanyOpen(query).then(r => {
                this.$set(item, 'childOrganizations', r.resultData);
                this.treeValue.saveValue = JSON.parse(
                  JSON.stringify(this.treeValue.treeData)
                );
              });
            }
          } else if (item.isHasChild && item.childOrganizations.length > 0) {
            this.$set(item, '$foldClose', !item['$foldClose']);
          }
        }
      },
      //树删除操作
      treeDelete(item) {
        this.$refs.title.click();
        if (item.organizationType !== 0 && item.organizationType !== 1) {
          //删除部门节点
          departmentDelete({
            organizationId: item.organizationId
          }).then(r => {
            this.$message({
              message: r.resultMsg,
              type: 'success'
            });
            this.getTreeData();
          });
        } else {
          //删除公司节点
          companyDelete({
            organizationId: item.organizationId
          }).then(r => {
            this.$message({
              message: r.resultMsg,
              type: 'success'
            });
            this.getTreeData();
          });
        }
      },
      fnclick(item, orgType) {
        //新增功能
        // debugger;
        this.$refs.title.click();
        if (orgType == 'department') {
          this.departmentDialogObj.type = 'add';
          this.departmentDialogObj.parentNodeInfo = item;
          this.dialogVisible.departmentVisible.visible = true;
        } else if (orgType == 'company') {
          this.companyDialogObj.type = 'add';
          this.companyDialogObj.parentNodeInfo = item;
          this.dialogVisible.companyVisible.visible = true;

        }
      },
      cancel() {
        this.$refs.title.click();
      },
      //树编辑
      treeEdit(item) {
        this.companyDialogObj.parentNodeInfo = item.$parent;
        this.companyDialogObj.nodeInfo = item;
        this.groupDialogObj.nodeInfo = item;
        this.departmentDialogObj.parentNodeInfo = item.$parent;
        this.departmentDialogObj.nodeInfo = item;
        this.$refs.title.click();
        if (item.organizationType == 2) {
          //部门
          this.departmentDialogObj.type = 'edit';
          this.dialogVisible.departmentVisible.visible = true;
        } else if (item.organizationType == 1) {
          //公司
          this.companyDialogObj.type = 'edit';
          this.dialogVisible.companyVisible.visible = true;
        } else if (item.organizationType == 0) {
          //集团
          // this.groupDialogObj.visible.visible = true;
          this.dialogVisible.groupVisible.visible = true;
        }
      },
      handleClick(item) {
        this.dpOrganizationId = '';
        this.objActive = item;
        this.initIndex = item.organizationId;
        this.index = item;
        if (item.organizationId) {
          this.searchConditions.organizationId = item.organizationId;
          this.searchConditions.companyId = item.companyId;
          this.searchConditions.departmentId = item.departmentId;
        }
        this.searchConditions.mainSearch = '';
        this.searchConditions.pageNum = 1;
        this.$emit('handle-click');
        this.$emit('element-tree-item-click', item);
      },
      /**
       * handle dropdown click
       * @params item
       */
      handleDropdownClick(item) {
        this.dpOrganizationId = item.organizationId;
      },
      /**
       * handle dropdown visible change
       * @params val
       */
      handleDpVisibleChange(val) {
        this.dpVisible = val;
      },
      //获取树数据
      getTreeData(isFirst) {
        this.treeloading = true;
        if (isFirst) {
          this.searchConditions.treeConditions = [
            {
              comparison: 'LIKE',
              fieldName: 'path',
              fieldValue: '/',
              type: 'text'
            }
          ];
        }
        // 控制只显示到公司节点
        const query = {};
        if (this.orgTypeFilter) {
          Object.assign(query, {orgType: this.orgTypeFilter});
        }
        treeDataFetch(query).then(r => {
          this.treeValue.treeData = r.resultData;
          this.treeValue.saveValue = JSON.parse(JSON.stringify(r.resultData));
          //默认选中第一项
          this.initIndex = r.resultData.organizationId;
          this.searchConditions.organizationId = r.resultData.organizationId;
          this.searchConditions.companyId = r.resultData.companyId;
          this.searchConditions.departmentId = r.resultData.departmentId;
          this.treeloading = false;
          this.$emit('handle-click', null, true);
          this.$emit('element-tree-item-click', r.resultData);
        });
      }
    },
    created() {
      //树数据初始化
      this.getTreeData(true);
    }
  };
</script>
<style>

</style>
<style scoped="">
  @import url("../../../../assets/css/Modular/tree/tree.scss");
</style>
