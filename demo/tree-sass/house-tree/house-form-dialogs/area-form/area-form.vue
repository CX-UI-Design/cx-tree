<!--区域表单-->
<template>
  <ns-dialog :title="title" size="large" :visible.sync="dialogVisible" @close="dialogClose(autoFormID)"
             v-if="dialogVisible">
    <el-tabs @tab-click="handleClick">
      <el-tab-pane label="基本信息" v-loading="loadingForm">
        <ns-auto-form
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
  import { getForm, detailForm } from '@/api/owner/house-element-tree';
  import * as store from '@/utils/nsQuery/nsStore';
  import areaData from './area-form.js';

  export default {
    name: 'house-tree-area-form',
    props: {
      //dialog 开关
      dialogVisible: {
        type: Object,
        default () {
          return {
            visible: false,
          };
        }
      },
      //点击的树节点的数据
      itemInfo: Object,
      //操作类型 新增、编辑
      type: String
    },
    data () {
      return {
        //============= other ==============
        title: '区域新增',
        houseInfo: {},

        //============= auto form ==============
        autoFormID: 'house-tree-area-form',//表单唯一ID值
        localData: areaData,
        submitUrl: 'owner/owner-rest/house/add-house-node',
        coverData: {},
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
        changeLogItems: [],//操作日志---时间轴数据
        loadingForm: true
      };
    },
    created () {
      this.init();//初始化
    },
    methods: {
      handleClick (tab, event) {
//        console.log('-----------------------------------');
//        console.log(tab);
//
//        console.log(event);
      },
      //================== 初始化相关操作 ====================
      init () {
        store.vm.set(this.autoFormID, this);
        this.getHouseInfo();
      },
      //获取HouseInfo
      getHouseInfo () {
        if (this.type === 'edit') {
          detailForm({houseId: this.itemInfo.houseId}).then((r) => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.changeDialogShowState();
          });
          this.title = '区域编辑';
        } else {
          getForm({houseType: 1, houseId: 0}).then((r) => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.changeDialogShowState();
          });
          this.title = '区域新增';
        }
      },
      // 把houseJson赋给houseInfo
      setHouseInfo (houseJson) {
        try {
          this.houseInfo = JSON.parse(houseJson);
        } catch (e) {
          this.houseInfo = {};
        }
        this.changeDialogShowState();
      },

      //================== 自动表单相关操作 ====================
      /**
       *auto Form Submit 自动表单提交事件
       * @param formName
       */
      autoFormSubmit (formName) {
        this.autoForm.validate(formName).then(
          params => {
            let modelData = JSON.parse(JSON.stringify(params.formData.modelData));
            if (this.type === 'edit') {
              modelData.houseId = this.itemInfo.houseId;
            }
            modelData.parentId = 0;
            modelData.houseType = '1';
            modelData.houseTypeEnum = 'AREA';
            modelData.houseInfo = this.assignHouseInfo(modelData);

            this.autoForm.submit(this.submitUrl, modelData, (r) => {
              this.$message({message: '保存成功', type: 'success'});
              this.changeDialogShowState(false);
              console.log(this.itemInfo);
              console.log(modelData);
              if (this.type === 'add') {
                modelData.houseId = r;
                modelData.childOwnerHouseBaseInfoTreeNodeList = [];
                modelData.houseFullName = this.itemInfo.houseFullName ? this.itemInfo.houseFullName + '-' + modelData.houseName : modelData.houseName;
                this.itemInfo.childOwnerHouseBaseInfoTreeNodeList.push(modelData);
                this.itemInfo.isHasChild = true;
              } else {
                this.itemInfo.houseName = modelData.houseName;
              }
              this.$emit('transferValue', this.itemInfo);
              store.formController.delete(formName);//销毁表单
              this.dialogVisible.visible = false;
            });
          }
        ).catch((err) => {
          console.log('表单验证失败');
        });
      },

      /**
       * 提交前的赋值HouseInfo
       * @param modelData
       */
      assignHouseInfo (modelData) {
        this.houseInfo.houseName = modelData.houseName;
        return JSON.stringify(this.houseInfo);
      },

      /**
       * after request
       * @param vm    this
       * @param data  form data
       */
      afterRequest (vm, data) {
        let modelData = data.modelData;
        this.afterFormRequestAssign(modelData);
        this.loadingForm = false;
      },

      /**
       * 表单请求完成后的赋值操作
       * @param modelData
       */
      afterFormRequestAssign (modelData) {
        modelData.houseName = this.type === 'edit' ? this.houseInfo.houseName : '';
        modelData.parentId = this.type === 'edit' ? this.houseInfo.parentId : '';
      },

      /**
       * auto form cancel 表单取消按钮 => 关闭弹窗
       * @param formName
       */
      autoFormCancel (formName) {
        store.formController.delete(formName);//销毁表单
        this.dialogVisible.visible = false;//关闭弹窗
      },

      //================== 其他 ====================
      /**
       * dialog close 关闭弹窗
       * @param formName
       */
      dialogClose (formName) {
        store.formController.delete(formName);
        this.dialogVisible.visible = false;
      },

      // 注册渲染表单
      changeDialogShowState () {
        // getHouseInfo获取到数据之后注册渲染表单
        store.formController.set(this.autoFormID, {show: true});//注册渲染表单
      }
    },
  };
</script>

<style>

</style>
