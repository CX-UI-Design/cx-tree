<!--公共区域表单-->
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
        <div class="lock-icon-wrap" v-if="type==='edit'">
          <i title="已解锁" v-if="houseInfo.isLock == 0">
            <ns-icon-svg icon-class="suoopen"></ns-icon-svg>
          </i>
          <i title="已锁定" v-else>
            <ns-icon-svg icon-class="suo"></ns-icon-svg>
          </i>
        </div>
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
  import {getForm, detailForm} from "@/api/owner/house-element-tree";
  import * as store from "@/utils/nsQuery/nsStore";
  import resetData from "./publicArea-form.js";
  import {createQRCode} from "@/utils/QRCode";

  export default {
    name: "house-element-tree-publicArea-form",
    props: {
      //dialog 开关
      dialogVisible: {
        type: Object, default: function () {
          return {
            visible: false,
          }
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
        title: "",
        houseInfo: {},
        loadingForm: true,

        //============= auto form ==============
        autoFormID: "house-element-tree-publicArea-form",//表单唯一ID值
        localData: resetData,
        submitUrl: "owner/owner-rest/house/add-house-node",
        coverData: {
          resourcefieldBindingfnList: {
            houseName: (params) => {
              //当名称houseName的事件类型为 blur失焦时，保持简称的值与名称同步更改，基础组件需增加失焦事件
              if (params.type === 'blur') {
                if(params.formData.modelData.publicAreaShortName===undefined||params.formData.modelData.publicAreaShortName===''){
                  params.formData.modelData.publicAreaShortName = params.formData.modelData.houseName
                }
              }
            },
          },
          dynamicQuery: {},
          isResourcefieldRemoved: {},
          items: {},
          isResourcefieldHidden: {}
        },
        buttonInfo: [],
        // 未锁定状态下的按钮
        buttonInfo1: [
          {
            funcType: "submit",
            style: "primary",
            code: "formConfirmBtn",
            name: "确定",
            areaType: "FORM",
            btnType: "single",
            event: this.autoFormSubmit
          },
          {
            funcType: "custom",
            style: "",
            code: "formCancelBtn",
            name: "取消",
            areaType: "FORM",
            btnType: "single",
            event: this.autoFormCancel
          }
        ],
        // 锁定状态下的按钮
        buttonInfo2: [],

        //表单fields
        assignList: [
          "parentId",
          "houseName",
          "publicAreaShortName",
          "houseNo",
          "deliveryTime",
          "developer",
          "remark",
          "startWorkTime",
          "completeTime",
          "buildingArea",
          "builder"
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
        if (this.type === "edit") {
          detailForm({houseId: this.itemInfo.houseId}).then(r => {
            this.setHouseInfo(r.resultData.houseJson);
            this.CHECKDO_isLock();
          }).catch(() => {
            this.changeDialogShowState();
          });
          this.title = "公共区域编辑";
        } else {
          getForm({houseType: 2, houseId: 0}).then(r => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.changeDialogShowState();
          });
          this.buttonInfo = this.buttonInfo1;
          this.title = "公共区域新增";
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
        this.houseInfo.isVirtual = this.houseInfo.isVirtual ? 1 : 0;
        this.houseInfo.isBlockUp = this.houseInfo.isBlockUp ? 1 : 0;
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
        if (this.type === "edit") {
          modelData.isVirtual = modelData.isVirtual === 1;
          modelData.isBlockUp = modelData.isBlockUp === 1;
          modelData.parentHouseName = this.houseInfo.parentId === 0 ? '' : this.houseInfo.houseFullName.replace("-" + this.houseInfo.houseName, "");
          this.assignQRCode(modelData);//二维码
        }
        //新增
        else {
          modelData.parentHouseName = this.itemInfo.houseFullName || "";
          this.assignQRCode(false);
        }
      },

      //================== 自动表单相关操作 ====================
      /**
       *auto Form Submit 自动表单提交事件
       * @param formName
       */
      autoFormSubmit(formName) {
        this.autoForm.validate(formName).then(params => {
          let modelData = params.formData.modelData;
          if (this.type === "edit") {
            modelData.houseId = this.itemInfo.houseId;
          } else {
            modelData.parentId = this.itemInfo.houseId;
          }
          modelData.houseType = '9';
          modelData.houseTypeEnum = "PUBLICAREA";
          modelData.houseInfo = this.assignHouseInfo(modelData);
          this.autoForm.submit(this.submitUrl, modelData, (r) => {
            this.$message({message: '保存成功', type: 'success'});
            if (this.type === 'add') {
              modelData.houseId = r;
              modelData.houseFullName = this.itemInfo.houseFullName + '-' + modelData.houseName;
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
          console.log("表单验证失败");
        });
      },

      /**
       * after request
       * @param vm    this
       * @param data  form data
       */
      afterRequest(vm, data) {
        let modelData = data.modelData;
        this.fields = data.fields;
        if (this.houseInfo.isLock === 1) {
          this.afterFormRequestRemoved(data.fields, true);//不可编辑
        } else {
          this.afterFormRequestRemoved(data.fields, false);//可编辑
        }
        this.afterFormRequestAssign(modelData);
        this.loadingForm = false;
      },

      /**
       * 锁定状态下不可编辑
       * @param fields
       * @param isRemoved
       */
      afterFormRequestRemoved(fields, isRemoved) {
        fields.forEach((item) => {
          item.isResourcefieldRemoved = isRemoved;
          if (item.children && item.children.length > 0) {
            this.afterFormRequestRemoved(item.children, isRemoved);
          }
        });
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
      //根据锁定字段值 赋值给 buttonInfo
      CHECKDO_isLock() {
        this.buttonInfo = this.houseInfo.isLock === 1 ? this.buttonInfo2 : this.buttonInfo1;
      },

      // 注册渲染表单
      changeDialogShowState() {
        // getHouseInfo获取到数据之后注册渲染表单
        store.formController.set(this.autoFormID, {show: true});//注册渲染表单
      },

      //二维码信息赋值到modelData
      assignQRCode(modelData) {
        if (modelData) {
          let QRCodeData = this.makeQRCode(),
            $src;
          setTimeout(() => {
            $src = QRCodeData._oDrawing._elImage.src;
            modelData.qrCode = $src;
          }, 0);
          this.coverData.isResourcefieldHidden = {
            qrCode: false
          }
        } else {
          this.coverData.isResourcefieldHidden = {
            qrCode: true
          }
        }
      },
      //生成二维码
      makeQRCode() {
        let qrCodeInfo = {
            organizationId: this.houseInfo.organizationId,
            precinctId: this.houseInfo.precinctId,
            houseId: this.houseInfo.houseId
          },
          $qrCodeInfo = JSON.stringify(qrCodeInfo);
        return createQRCode(null, {
          text: $qrCodeInfo,
          width: 150,
          height: 150
        });
      }
    },
  };
</script>

<style rel="stylesheet/scss" lang="scss">
  .lock-icon-wrap {
    position: absolute;
    right: 0;
    top: 0;
    .ns-svg-icon {
      font-size: 22px;
      color: #6e6e6e;
    }
  }
</style>
