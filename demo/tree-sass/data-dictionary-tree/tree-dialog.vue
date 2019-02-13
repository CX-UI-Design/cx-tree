<template>
  <ns-dialog id="dictionary_tree_dialog"  :title="title" :visible.true="visible"  size="small"  type="autoHeight" @close="dialogClose">
    <ns-auto-form
      autoFormID="dictionary_tree_form"
      :submit-url="submitUrl"
      :cover-data="coverData"
      :is-local="true"
      :local-data="autoFormoLcaldata"
      cue-type="only-error"
      @afterRequest="afterRequest"
    >
    </ns-auto-form>
    <!--按钮-->
    <div slot="footer">
      <ns-auto-form-operation :buttonInfo="buttonInfo" autoFormID="dictionary_tree_form"></ns-auto-form-operation>
    </div>
  </ns-dialog>
</template>

<script>
  import ns from '@/utils/nsQuery/nsQuery'
  import * as store from '@/utils/nsQuery/nsStore'
  import {reset_group, reset_dic} from './reset'
  import {dicGroupDetailFetch} from '@/api/system/dictionary-element-tree';

  export default {
    props: {
      visible: {
        type: Object,
        default() {
          return {
            visible: true
          }
        }
      },
      type: null,
      organizationId: null,
      itemInfo: {
        type: Object
      },
      detailInfo: {
        type: Object
      }
    },
    data() {
      return {
        buttonInfo: [{
          funcType: 'submit',
          style: 'primary',
          code: 'formConfirmBtn',
          name: '确定',
          areaType: 'FORM',
          btnType: 'single',
          index: '6',
          event: this.submit
        },
          {
            funcType: 'custom',
            style: '',
            code: 'formCancelBtn',
            name: '取消',
            areaType: 'FORM',
            btnType: 'single',
            event: this.cancelHandle
          },
        ],
        autoFormoLcaldata: {},
        coverData: {},
        title: "",
        submitUrl: "",
      }
    },
    created() {
      if (this.type === "add-dic") {
        this.title = '新增字典';
        this.autoFormoLcaldata = reset_dic;
        this.submitUrl = "/system/dictionary/add-dictionary"
        this.changeDialogShowState(true);
      } else if (this.type === "add-group") {
        this.title = '新增字典类型';
        this.autoFormoLcaldata = reset_group;
        this.submitUrl = "/system/dictionary/add-dictionaryGroup"
        this.changeDialogShowState(true);
      } else if (this.type === "edit-group") {
        this.title = '编辑字典类型';
        this.autoFormoLcaldata = reset_group;
        this.submitUrl = "/system/dictionary/edit-dictionaryGroup";
        this.changeDialogShowState(true);
      } else if (this.type === "edit-dic") {
        this.title = '编辑字典';
        this.autoFormoLcaldata = reset_dic;
        this.submitUrl = "/system/dictionary/edit-dictionary";
        this.changeDialogShowState(true)
      }
    },
    methods: {
      dialogClose() {
        this.changeDialogShowState(false)
      },
      //执行dialog开关的一系列操作
      changeDialogShowState(type) {
        if (type) {
          store.formController.set('dictionary_tree_form', {
            show: true
          });
        } else {
          this.autoForm.resetForm('dictionary_tree_form').then(params => {
            store.formController.delete('dictionary_tree_form');
            this.visible.visible = false;
          });
          //手动清空
          for (let key in this.autoFormoLcaldata.modelData) {
            if (typeof this.autoFormoLcaldata.modelData[key] !== 'object') {
              this.autoFormoLcaldata.modelData[key] = ''
            } else {

            }
          }
        }
      },
      fetchEditInfo() {
        const _this = this;
      },
      /*
             detail Info Assignment(详情信息赋值)
             * */
      detailInfoAssignment() {
        if (this.type === "edit-group" || this.type === "edit-dic") {
          this.modelShowData.modelData = this.detailInfo;
        }
      },
      afterRequest(vm, data) {
        this.modelShowData = data;
        this.detailInfoAssignment();
        if (this.type === "add-dic" || this.type === "add-group") {
          data.modelData.organizationId = this.organizationId;
          data.modelData.dictionaryGroupId = this.itemInfo.nodeValue;
        }
      },
      cancelHandle(formName) {
        this.changeDialogShowState(false);
      },
      submit(formName) {
        //1、再进行JEPF动态表单验证
        this.autoForm.validate(formName).then(
          //2、JEPF动态表单验证通过
          params => {
            //设置提交参数，根据实际情况
            const query = params.formData.modelData;
            //提交后台
            this.autoForm.submit(this.submitUrl, query, () => {
              this.$emit('query');
              this.$message({
                message: '添加成功',
                type: 'success'
              });
              this.changeDialogShowState(false);
            })
          }
        ).catch((err) => {
          return false;
        })
      }
    }
  }
</script>

<style rel="stylesheet/less" lang="scss">
  #dictionary_tree_dialog.ns-dialog {
    .el-dialog {
      height: 280px;
    }
    .ns-autoForm-content {
      min-height: 0;
    }
    .ns-autoForm-scroll {
      padding-bottom: 5px;
    }
  }
</style>
