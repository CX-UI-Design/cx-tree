<template>
	<ns-dialog id="add-or-edit-group" title="集团编辑" :visible.sync="visible" type="autoHeight" @close="dialogClose">
		<ns-form :model="groupForm" class="invariable" :rules="rules" ref="groupForm" label-width="150px">
			<ns-form-item label="集团名称" prop="groupName">
				<ns-input size="small" v-model="groupForm.groupName" placeholder="请输入集团名称"></ns-input>
			</ns-form-item>
			<ns-form-item label="集团编号" prop="groupCode">
				<ns-input size="small" v-model="groupForm.groupCode" placeholder="请输入集团编号"></ns-input>
			</ns-form-item>
			<ns-form-item label="集团简称" prop="groupShortName">
				<ns-input size="small" v-model="groupForm.groupShortName" placeholder="请输入集团简称"></ns-input>
			</ns-form-item>
			<ns-form-item label="备注" prop="remark">
				<ns-input type="textarea" v-model="groupForm.remark" placeholder="请输入备注" :rows="4" spec="adapt" height="auto"></ns-input>
			</ns-form-item>
		</ns-form>
		<span slot="footer" class="dialog-footer">
			<ns-button type="primary"  @click.native="formSubmit" size="medium">确 定</ns-button>
		    <ns-button @click="closeHandle" size="medium">取 消</ns-button>
		</span>
	</ns-dialog>
</template>

<script>
import { fetchOrgDetail, groupEdit } from "@/api/system/organize-element-tree";
export default {
  props: {
    visible: {
      type: Object,
      default() {
        return {
          visible: false
        };
      }
    },
    nodeInfo: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      groupForm: {
        //集团表单
        groupCode: "",
        groupShortName: "",
        organizationId: "",
        groupId: "",
        groupName: "",
        remark: ""
      },
      rules: {
        groupName: [
          { required: true, message: "请输入集团名称", trigger: "blur" }
        ],
        groupShortName: [
          { required: true, message: "请输入集团简称", trigger: "blur" }
        ]
      }
    };
  },
  watch: {},
  methods: {
    resetForm() {
      //==表单重置
      this.$refs["groupForm"].$refs['form'].resetFields();
    },
    formSubmit() {
      //==表单提交
      this.$refs["groupForm"].$refs['form'].validate(valid => {
        if (valid) {
          //编辑保存
          groupEdit(this.groupForm).then(r => {
            this.$message({
              message: "保存成功",
              type: "success"
            });
            this.$emit("query");
            this.visible.visible = false;
          });
        }
      });
    },
    //编辑信息
    fetchEditData() {
      fetchOrgDetail({
        organizationId: this.nodeInfo.organizationId
      }).then(r => {
        this.groupForm = r.resultData.group;
      });
    },
    dialogClose() {
      this.resetForm();
    },
     //取消
    closeHandle() {
      this.resetForm();
      this.visible.visible = false;
    }
  },
  created() {
    this.fetchEditData();
  },
  updated() {}
};
</script>

<style rel="stylesheet/less" lang="scss">
/*@import "../../../../../assets/css/Modular/invariable-form/invariable-form.scss";*/
/*.win .ns-container #add-or-edit-group {*/
  /*.el-dialog {*/
    /*width: 650px;*/
  /*}*/
  /*.el-input {*/
    /*width: 200px;*/
  /*}*/
  /*div.el-dialog__body {*/
    /*max-height: 550px;*/
    /*overflow-y: auto;*/
  /*}*/
  /*div.el-dialog__body::-webkit-scrollbar {*/
      /*width: 10px;*/
      /*height: 10px;*/
  /*}*/
  /*.el-textarea__inner {*/
    /*width: 350px;*/
  /*}*/
  /*.width350 {*/
    /*width: 350px;*/
  /*}*/
/*}*/
</style>
