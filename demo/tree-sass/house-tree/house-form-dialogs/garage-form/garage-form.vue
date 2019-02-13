<!--车库表单-->
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
      <el-tab-pane label="操作日志" v-if="type==='edit'">
        <ns-import-logs :importData="{id:itemInfo.houseId,type:'houseTreeOrViewsForm'}"></ns-import-logs>
      </el-tab-pane>
    </el-tabs>
    <!--按钮-->
    <div slot="footer">
      <ns-auto-form-operation :buttonInfo="buttonInfo" :autoFormID="autoFormID"></ns-auto-form-operation>
    </div>
  </ns-dialog>
</template>

<script>
  import { getForm, detailForm } from '@/api/owner/house-element-tree';
  import * as store from '@/utils/nsQuery/nsStore';
  import resetData from './garage-form.js';

  export default {
    name: 'house-tree-garage-form',
    props: {
      //dialog 开关
      dialogVisible: {
        type: Object, default: function () {
          return {
            visible: false,
          };
        }
      },
      //点击的树节点的数据
      itemInfo: {
        type: Object
      },
      //操作类型 新增、编辑
      type: {
        type: String
      }
    },
    data() {
      return {
        //============= other ==============
        title: '',
        houseInfo: {},
        operationType: {isTrue: true},

        //============= auto form ==============
        autoFormID: 'house-tree-garage-form',//表单唯一ID值
        localData: resetData,
        submitUrl: 'owner/owner-rest/house/add-house-node',
        coverData: {
          resourcefieldBindingfnList: {
            houseName: (params) => {
              //当名称houseName的事件类型为 blur失焦时，保持简称的值与名称同步更改，基础组件需增加失焦事件
              if (params.type === 'blur') {
                if (params.formData.modelData.garageShortName === undefined || params.formData.modelData.garageShortName === '') {
                  params.formData.modelData.garageShortName = params.formData.modelData.houseName;
                }
              }
            },
          },
          dynamicQuery: {},
        },
        buttonInfo: [
          {
            funcType: 'submit',
            style: 'primary',
            code: 'formConfirmBtn',
            name: '确定',
            areaType: 'FORM',
            btnType: 'single',
            event: this.autoFormSubmit,
          },
          {
            funcType: 'custom',
            style: '',
            code: 'formCancelBtn',
            name: '取消',
            areaType: 'FORM',
            btnType: 'single',
            event: this.autoFormCancel,
          },
        ],
        loadingForm: true,

        //表单fields
        assignList: [
          'parentId',
          'parentHouseName',
          'houseName',
          'garageShortName',
          'houseNo',
          'builder',
          'remark',
          'developer',
          'carportCount',
          'buildingArea',
          'deliveryTime'
        ],
        changeLogItems: [],//操作日志---时间轴数据
      };
    },
    created() {
      this.init();//初始化
    },
    methods: {
      //================== 初始化相关操作 ====================
      init() {
        store.vm.set(this.autoFormID, this);
        this.getHouseInfo();
      },

      //获取HouseInfo
      getHouseInfo() {
        if (this.type === 'edit') {
          detailForm({houseId: this.itemInfo.houseId}).then((r) => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.changeDialogShowState();
          });
          this.title = '车库编辑';
        } else {
          getForm({houseType: 2, houseId: 0}).then((r) => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.changeDialogShowState();
          });
          this.title = '车库新增';
        }
      },
      // 把houseJson赋给houseInfo
      setHouseInfo(houseJson) {
        try {
          this.houseInfo = JSON.parse(houseJson);
        } catch (e) {
          this.houseInfo = {};
        }
        this.changeDialogShowState();
      },

      /**
       * 提交前的赋值HouseInfo
       * @param modelData
       */
      assignHouseInfo(modelData) {
        this.assignList.forEach((value, index) => {
          this.$set(this.houseInfo, value, modelData[value]);
        });
        return JSON.stringify(this.houseInfo);
      },

      /**
       * 表单请求完成后的赋值操作
       * @param modelData
       */
      afterFormRequestAssign(modelData) {
        this.assignList.forEach((value, index) => {
          this.$set(modelData, value, this.houseInfo[value]);
        });
        //编辑
        if (this.type === 'edit') {
          modelData.parentHouseName = this.houseInfo.parentId === 0 ? '' : this.houseInfo.houseFullName.replace('-' + this.houseInfo.houseName, '');
        }
        //新增
        else {
          modelData.parentHouseName = this.itemInfo.houseFullName || '';
        }
      },

      //================== 自动表单相关操作 ====================
      /**
       *auto Form Submit 自动表单提交事件
       * @param formName
       */
      autoFormSubmit(formName) {
        this.autoForm.validate(formName).then(
          params => {
            let modelData = params.formData.modelData;
            if (this.type === 'edit') {
              modelData.houseId = this.itemInfo.houseId;
            } else {
              modelData.parentId = this.itemInfo.houseId;
            }
            modelData.houseType = '7';
            modelData.houseTypeEnum = 'GARAGE';
            modelData.houseInfo = this.assignHouseInfo(modelData);
            this.autoForm.submit(this.submitUrl, modelData, (r) => {
              this.$message({message: '保存成功', type: 'success'});
              if (this.type === 'add') {
                modelData.houseId = r;
                modelData.houseFullName = this.itemInfo.houseFullName + '-' + modelData.houseName;
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
          }
        ).catch((err) => {
          console.log('表单验证失败');
        });
      },

      /**
       * after request
       * @param vm    this
       * @param data  form data
       */
      afterRequest(vm, data) {
        let modelData = data.modelData;
        this.afterFormRequestAssign(modelData);
        this.loadingForm = false;
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
        // getHouseInfo获取到数据之后注册渲染表单
        store.formController.set(this.autoFormID, {show: true});//注册渲染表单
      }
    }
  };
</script>

<style rel="stylesheet/less" lang="scss" scoped>
  /*#importLog {*/
  /*.import-log_items {*/
  /*height: calc(100% - 32px);*/
  /*overflow: auto;*/
  /*}*/
  /*.line_top_title {*/
  /*float: left;*/
  /*height: 100%;*/
  /*line-height: 26px;*/
  /*font-size: 14px;*/
  /*color: #333;*/
  /*font-weight: bold;*/
  /*}*/
  /*.axis-item_desc {*/
  /*margin-left: 18px;*/
  /*.axis-detail {*/
  /*color: #409eff;*/
  /*}*/
  /*}*/
  /*.pagination {*/
  /*text-align: center;*/
  /*}*/
  /*}*/
</style>
