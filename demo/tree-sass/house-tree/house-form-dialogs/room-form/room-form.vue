<!--新增/编辑房间表单-->
<template>
  <ns-dialog :title="title" size="large" :visible.sync="dialogVisible" @close="dialogClose(autoFormID)"
             v-if="dialogVisible">
    <el-tabs>
      <el-tab-pane label="基本信息" v-loading="loadingForm">
        <ns-auto-form :autoFormID="autoFormID"
                      :submit-url="submitUrl"
                      :is-local="true"
                      :local-data="localData"
                      :query="{}"
                      :cover-data="coverData"
                      cue-type="only-error"
                      @afterRequest="afterRequest">
        </ns-auto-form>
        <div class="lock-icon-wrap" v-if="type==='edit'">
          <ns-icon-svg icon-class="suoopen" v-if="houseInfo.isLock === 0"></ns-icon-svg>
          <ns-icon-svg icon-class="suo" v-else></ns-icon-svg>
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
  import {getForm, detailForm, fetchRelateData} from "@/api/owner/house-element-tree";
  import * as store from "@/utils/nsQuery/nsStore";
  import resetData from "./room-form.js";
  import {createQRCode} from "@/utils/QRCode";

  export default {
    name: "house-tree-room-form",
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
        afterGetHouse: false, // getHouseInfo请求是否执行完
        afterGetDict: false,  // getDictionary请求是否执行完

        //============= auto form ==============
        autoFormID: "house-tree-room-form",//表单唯一ID值
        localData: resetData,
        submitUrl: "owner/owner-rest/house/add-house-node",
        coverData: {
          resourcefieldBindingfnList: {
            houseName: (params) => {
              //当名称houseName的事件类型为 blur失焦时，保持简称的值与名称同步更改，基础组件需增加失焦事件
              if (params.type === 'blur') {
                if(params.formData.modelData.roomShortName===undefined||params.formData.modelData.roomShortName===''){
                  params.formData.modelData.roomShortName = params.formData.modelData.houseName
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
        buttonInfo2: [], // 锁定状态下的按钮

        //============= select 下拉列表options ==============
        roomTypeIdItems: [], // 房产类型下拉列表数据
        roomPropertyIdItems: [], // 房产性质下拉列表数据
        roomHouseTypeItems: [], // 房产户型下拉列表数据

        //表单fields
        assignList: [
          "houseName",
          "roomTypeId",
          "roomShortName",
          "houseNo",
          "isVirtual",
          "isBlockUp",
          "floor",
          "floorNum",
          "chargingArea",
          "assistChargingArea",
          "roomPropertyId",
          "roomHouseType",
          "deliveryTime",
          "takeOverTime",
          "remark",
          "insideArea",
          "poolArea",
          "gardenArea",
          "basementArea",
          "giftArea",
          "buildingArea",
          "maintenanceDate",
          "parentId"
        ],
        changeLogItems: [],//操作日志---时间轴数据
        loadingForm: true
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
        this.getDictionary();
      },
      //获取HouseInfo
      getHouseInfo() {
        if (this.type === "edit") {
          detailForm({
            houseId: this.itemInfo.houseId
          }).then(r => {
            this.setHouseInfo(r.resultData.houseJson);
            this.CHECKDO_isLock();
          }).catch(() => {
            this.afterGetHouse = true;
          });
          this.title = "房产编辑";
        } else {
          getForm({
            houseType: 2,
            houseId: 0
          }).then(r => {
            this.setHouseInfo(r.resultData.houseJson);
          }).catch(() => {
            this.afterGetHouse = true;
          });
          this.buttonInfo = this.buttonInfo1;
          this.title = "房产新增";
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
            "proNature",
            "performanceStatus",
            "proTypeId",
            "roomTypeId",
            "roomPropertyId",
            "roomHouseType",
            "carportTypeId"
          ]
        }).then(res => {
          let resultData = res.resultData;
          if (resultData.roomTypeId && resultData.roomTypeId.length) {
            this.formatSelectItems("roomTypeIdItems", resultData.roomTypeId[0].dictionaryitemVos); //房产类型
          }
          if (resultData.roomPropertyId && resultData.roomPropertyId.length) {
            this.formatSelectItems("roomPropertyIdItems", resultData.roomPropertyId[0].dictionaryitemVos); //房产性质
          }
          if (resultData.roomHouseType && res.resultData.roomHouseType.length) {
            this.formatSelectItems("roomHouseTypeItems", resultData.roomHouseType[0].dictionaryitemVos); //房产户型
          }
          this.afterGetDict = true;
        }).catch(res => {
          this.afterGetDict = true;
        });
      },

      /**
       * 提交前的赋值HouseInfo
       * @param modelData
       */
      assignHouseInfo(modelData) {
        this.assignList.forEach((value, index) => {
          if (value === "maintenanceDate" && modelData[value] === "") {
            modelData[value] = [];
          }
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
          if (modelData["maintenanceDate"][0] === null && modelData["maintenanceDate"][1] === null) {
            modelData["maintenanceDate"] = [];
          }
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
          let modelData = JSON.parse(JSON.stringify(params.formData.modelData));
          if (modelData.takeOverTime && modelData.deliveryTime) {
            if (Date.parse(modelData.deliveryTime) > Date.parse(modelData.takeOverTime)) {
              return this.$message({message: "收房日期不能小于移交日期", type: "error"});
            }
          }
          if (this.type === "edit") {
            modelData.houseId = this.itemInfo.houseId;
          } else {
            modelData.parentId = this.itemInfo.houseId;
          }
          modelData.houseType = '6';
          modelData.houseTypeEnum = "ROOM";
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

        //赋值特定select 的 options 下拉数组列表
        this.coverData.items = {
          roomPropertyId: this.roomPropertyIdItems,
          roomTypeId: this.roomTypeIdItems,
          roomHouseType: this.roomHouseTypeItems
        };

        //表单请求完成后的赋值操作
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

      /**
       * 二维码信息赋值到modelData
       * @param modelData
       */
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
      },
      //根据锁定字段值 赋值给 buttonInfo
      CHECKDO_isLock() {
        this.buttonInfo = this.houseInfo.isLock === 1 ? this.buttonInfo2 : this.buttonInfo1;
      },

      // 注册渲染表单
      changeDialogShowState() {
        // getHouseInfo和getDictionary两个方法获取到数据之后注册渲染表单
        if (this.afterGetHouse && this.afterGetDict) {
          store.formController.set(this.autoFormID, {show: true});//注册渲染表单
        }
      },
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

<style rel="stylesheet/scss" lang="scss" scoped>
  .lock-icon-wrap {
    position: absolute;
    right: 0;
    top: 0;
    svg.ns-svg-icon {
      font-size: 22px;
      color: #6e6e6e;
    }
  }
</style>
