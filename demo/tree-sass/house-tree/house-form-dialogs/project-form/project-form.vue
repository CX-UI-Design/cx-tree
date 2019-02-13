<!--项目表单-->
<template>
  <ns-dialog :title="title" size="large" :visible.sync="dialogVisible" @close="dialogClose(autoFormID)"
             v-if="dialogVisible">
    <el-tabs>
      <el-tab-pane label="基本信息" v-loading="loadingForm">
        <ns-auto-form
          ref="autoForm"
          :autoFormID="autoFormID"
          :submit-url="submitUrl"
          :is-local="true"
          :local-data="localData"
          :query="{}"
          :cover-data="coverData"
          cue-type="only-error"
          @afterRequest="afterRequest">
        </ns-auto-form>
      </el-tab-pane>
      <el-tab-pane label="操作日志" v-if="type === 'edit'">
        <ns-import-logs :importData="{id: itemInfo.houseId, type: 'houseTreeOrViewsForm'}"></ns-import-logs>
      </el-tab-pane>
    </el-tabs>
    <!--按钮-->
    <div slot="footer">
      <ns-auto-form-operation :buttonInfo="buttonInfo" :autoFormID="autoFormID"></ns-auto-form-operation>
    </div>
  </ns-dialog>
</template>

<script>
  import { getForm, detailForm, fetchRelateData } from '@/api/owner/house-element-tree';
  import { treeDataFetch, treeCompanyOpen } from '@/api/system/organize-element-tree';
  import * as store from '@/utils/nsQuery/nsStore';
  import projectData from './project-form.js';

  export default {
    name: 'house-tree-project-form',
    props: {
      //dialog 开关
      dialogVisible: {
        type: Object,
        default: function () {
          return {
            visible: false,
          };
        }
      },
      //点击的树节点的数据
      itemInfo: Object,
      //树的数据
      treeValue: Object,
      //操作类型 新增、编辑
      type: String
    },
    data() {
      return {
        //============= other ==============
        title: '',
        houseInfo: {},
        afterGetHouse: false, // getHouseInfo请求是否执行完
        afterGetDict: false,  // getDictionary请求是否执行完

        //============= auto form ==============
        autoFormID: 'house-tree-project-form',//表单唯一ID值
        localData: projectData,
        submitUrl: 'owner/owner-rest/house/add-house-node',
        coverData: {
          resourcefieldBindingfnList: {
            houseName: (params) => {
              //当名称houseName的事件类型为 blur失焦时，保持简称的值与名称同步更改，基础组件需增加失焦事件
              if (params.type === 'blur') {
                if (params.formData.modelData.proShortName === undefined || params.formData.modelData.proShortName === '') {
                  params.formData.modelData.proShortName = params.formData.modelData.houseName;
                }
              }
            },
          },
          dynamicQuery: {
            provinceCityArea: {}
          },
          items: {},
        },
        buttonInfo: [
          {
            funcType: 'submit',
            style: 'primary',
            code: 'formConfirmBtn',
            name: '确定',
            areaType: 'FORM',
            btnType: 'single',
            event: this.autoFormSubmit
          },
          {
            funcType: 'custom',
            style: '',
            code: 'formCancelBtn',
            name: '取消',
            areaType: 'FORM',
            btnType: 'single',
            event: this.autoFormCancel
          }
        ],

        //============= select 下拉列表options ==============
        proTypeItems: [], // 项目类型下拉列表数据
        performanceStatusItems: [], // 履行状态下拉列表数据
        proNatureItems: [], // 项目性质下拉列表数据
        organizationIdItems: [],

        //表单fields
        assignList: [
          'houseName',
          'proShortName',
          'developer',
          'houseNo',
          'address',
          'proNature',
          'proTypeId',
          'performanceStatus',
          'proManager',
          'builder',
          'remark',
          'startWorkTime',
          'completeTime',
          'completeTime',
          'deliveryTime',
          'quitTime',
          'takeOverTime',
          'buildingArea',
          'floorArea',
          'groundArea',
          'undergroundArea',
          'deliveryArea',
          'greenArea',
          'assistArea',
          'greeningRate',
          'plotRatio',
          'households',
          'checkInHouseholds',
          'groundParkingSpace',
          'groundParkingChargeStandard',
          'tempParkingSpace',
          'proManagerPhone',
          'managementPhone',
          'servicePhone',
          'propertyManageArea',
          'propertyOperateArea',
          'hallArea',
          'communityArea',
          'chargeArea',
          'refOrganizationId',
          'parentId'
        ],
        changeLogItems: [],//操作日志---时间轴数据
        loadingForm: true
      };
    },
    created() {
      this.init();//初始化
      this.getTreeDataFetch();
    },
    methods: {
      //================== 初始化相关操作 ====================
      init() {
        store.vm.set(this.autoFormID, this);
        this.getHouseInfo();
        this.getDictionary();
      },
      //获取HouseInfo
      getHouseInfo() {
        if (this.type === 'edit') {
          detailForm({houseId: this.itemInfo.houseId}).then(r => {
            this.setHouseInfo(r.resultData.houseJson);
            this.getProvinceCityAreaQueryParams();
          }).catch(() => {
            this.afterGetHouse = true;
          });
          this.title = '项目编辑';
        } else {
          getForm({houseType: 2, houseId: 0}).then(r => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.afterGetHouse = true;
          });
          this.title = '项目新增';
        }
      },
      // 把houseJson赋给houseInfo
      setHouseInfo(houseJson) {
        try {
          this.houseInfo = JSON.parse(houseJson);
        } catch (e) {
          this.houseInfo = {};
        }
        this.afterGetHouse = true;
      },
      //格式化数据字典
      formatSelectItems(itemTxt, res) {
        console.log(res);
        this[itemTxt] = res.map((value, index, res) => {
          return {
            label: value.dictionaryitemItemname,
            value: value.dictionaryitemItemcode
          };
        });
      },
      //获取数据字典
      getDictionary() {
        fetchRelateData({
          dictionaryDdcodeList: [
            'proNature',
            'performanceStatus',
            'proTypeId',
            'roomTypeId',
            'roomPropertyId',
            'roomHouseType',
            'carportTypeId'
          ]
        }).then(res => {
          let resultData = res.resultData;
          if (resultData.proNature && resultData.proNature.length > 0) {
            //项目性质
            this.formatSelectItems('proNatureItems', resultData.proNature[0].dictionaryitemVos);
          }
          if (resultData.performanceStatus && resultData.performanceStatus.length > 0) {
            //履行状态
            this.formatSelectItems('performanceStatusItems', resultData.performanceStatus[0].dictionaryitemVos);
          }
          if (resultData.proTypeId && resultData.proTypeId.length > 0) {
            //项目类型
            this.formatSelectItems('proTypeItems', resultData.proTypeId[0].dictionaryitemVos);
          }
          //新增项目默认
          if (this.type === 'add') {
            projectData.modelData.proNature = '1';
            projectData.modelData.performanceStatus = '1';
          }
          this.afterGetDict = true;
        }).catch(res => {
          this.afterGetDict = true;
        });
      },

      //省市区地址查询参数
      getProvinceCityAreaQueryParams() {
        this.coverData.dynamicQuery.provinceCityArea = {
          province: this.houseInfo.provinceId,
          city: this.houseInfo.cityId,
          district: this.houseInfo.areaId
        };
      },

      /**
       * 表单请求完成后的赋值操作
       * @param modelData
       */
      afterFormRequestAssign(modelData) {

        this.assignList.forEach((value, index) => {
          this.$set(modelData, value, this.houseInfo[value]);
        });
        if (this.type === 'edit') {
          modelData.provinceCityArea = {
            province: this.houseInfo.provinceId,
            city: this.houseInfo.cityId,
            district: this.houseInfo.areaId
          };
          modelData.parentHouseName = this.houseInfo.parentId === 0 ? '' : this.houseInfo.houseFullName.replace('-' + this.houseInfo.houseName, '');
        } else {
          modelData.provinceCityArea = {
            province: '',
            city: '',
            district: ''
          };
          // console.log("==========***********===============")
          // console.log(this.treeValue)
          modelData.parentHouseName = this.itemInfo.houseFullName || '';
          // modelData.organizationId = this.treeValue.treeData.companyName;
          // modelData.refOrganizationId = this.treeValue.treeData.companyName;
        }
      },

      //================== 自动表单相关操作 ====================
      /**
       *auto Form Submit 自动表单提交事件
       * @param formName
       */
      autoFormSubmit(formName) {
        this.autoForm.validate(formName).then(params => {
          params.formData.modelData.organizationId = this.treeValue.treeData.organizationId;
          let modelData = JSON.parse(JSON.stringify(params.formData.modelData));

          if (this.type === 'edit') {
            modelData.houseId = this.itemInfo.houseId;
          } else {
            modelData.parentId = this.itemInfo.houseId;
          }
          modelData.houseType = '2';
          modelData.houseTypeEnum = 'PRECINCT';
          modelData.houseInfo = this.assignHouseInfo(modelData);

          this.autoForm.submit(this.submitUrl, modelData, (r) => {
            this.$message({message: '保存成功', type: 'success'});

            if (this.type === 'add') {
              modelData.houseId = r;
              modelData.houseFullName = this.itemInfo.houseFullName ? this.itemInfo.houseFullName + '-' + modelData.houseName : modelData.houseName;
              modelData.childOwnerHouseBaseInfoTreeNodeList = [];
              this.itemInfo.childOwnerHouseBaseInfoTreeNodeList.push(modelData);
              this.itemInfo.isHasChild = true;
            } else {
              this.itemInfo.houseName = modelData.houseName;
            }
            this.$emit('transferValue', this.itemInfo);
            store.formController.delete(formName);
            this.dialogVisible.visible = false;
          });
        }).catch(err => {
          console.log('表单验证失败');
        });
      },

      /**
       * 提交前的赋值HouseInfo
       * @param modelData
       */
      assignHouseInfo(modelData) {
        this.assignList.forEach((value, index) => {
          this.$set(this.houseInfo, value, modelData[value]);
        });
        if (modelData.provinceCityArea) {
          this.houseInfo.provinceId = modelData.provinceCityArea.province;
          this.houseInfo.cityId = modelData.provinceCityArea.city;
          this.houseInfo.areaId = modelData.provinceCityArea.district;
        }
        return JSON.stringify(this.houseInfo);
      },

      /**
       * after request
       * @param vm    this
       * @param data  form data
       */
      afterRequest(vm, data) {
        let modelData = data.modelData;
        //赋值特定select 的 options 下拉数组列表
        this.coverData.items = {
          proNature: this.proNatureItems,
          performanceStatus: this.performanceStatusItems,
          proTypeId: this.proTypeItems,
          refOrganizationId: this.organizationIdItems,
        };
        this.afterFormRequestAssign(modelData);
        if (this.type === 'add') {
          this.localData.modelData.refOrganizationId = this.treeValue.saveValue.organizationId;
        }
        this.loadingForm = false;
      },
      //获取部门组织树数据
      getTreeDataFetch() {
        treeDataFetch({}).then(r => {
          this.getOptionsItems([r.resultData]);
        });
      },
      /**
       * 将部门组织树数据转换为所属组织下拉框数据
       * @param arr
       */
      getOptionsItems(arr) {
        arr.map(item => {
          // if(item.organizationType===1 || item.organizationType===0){//筛选出所有公司
          this.organizationIdItems.push({label: item.organizationName, value: item.organizationId});
          if (item.isHasChild) {
            item.childOrganizations.length > 0 ? this.getOptionsItems(item.childOrganizations) : this.getChildOptionsItems(item.organizationId);
          }
          // }
        });
      },
      /**
       * 获取 子公司/子部门 数据
       * @param fatherId
       */
      getChildOptionsItems(fatherId) {
        treeCompanyOpen({organizationId: fatherId}).then(r => {
          this.getOptionsItems(r.resultData);
        }).catch(() => {console.log('error!');});
      },
      /**
       * auto form cancel 表单取消按钮 => 关闭弹窗
       * @param formName
       */
      autoFormCancel(formName) {
        store.formController.delete(formName);//销毁表单
        this.dialogVisible.visible = false;//关闭弹窗
      },

      //================== 其他 ====================
      /**
       * dialog close 关闭弹窗
       * @param formName
       */
      dialogClose(formName) {
        store.formController.delete(formName);
        this.dialogVisible.visible = false;
      },

      // 注册渲染表单
      changeDialogShowState() {
        // getHouseInfo和getDictionary两个方法获取到数据之后注册渲染表单
        if (this.afterGetHouse && this.afterGetDict) {
          store.formController.set(this.autoFormID, {show: true});//注册渲染表单
        }
      }
    },
    watch: {
      // 监听getHouseInfo请求执行完成
      afterGetHouse() {
        this.changeDialogShowState();
      },
      // 监听getDictionary请求执行完成
      afterGetDict() {
        this.changeDialogShowState();
      }
    }
  };
</script>
