<template>
	<el-dialog
		:title="title"
		id = "add-or-edit-department"
		:visible.sync="visible.visible"
    :modal-append-to-body="modalAppendToBody"
    :close-on-click-modal="closeOnClickModal"

		@close="dialogClose">
		<el-form :model="departmentForm" class="invariable" :rules="rules" ref="departmentForm" label-width="150px">
			<el-form-item label="上级组织" size="small" prop="parentOrganizationName">
				{{departmentForm.parentOrganizationName}}
			</el-form-item>
			<el-form-item label="部门名称" prop="departmentName">
				<el-input @blur="autoMakeMassage" size="small" v-model="departmentForm.departmentName" placeholder="请输入部门名称"></el-input>
			</el-form-item>
			<el-form-item label="部门编号" prop="departmentCode">
				<el-input v-judgeChange = "judgeChangeParams_code" size="small" v-model="departmentForm.departmentCode" placeholder="请输入部门编号"></el-input>
			</el-form-item>
			<el-form-item label="部门简称" prop="departmentShortName">
				<el-input v-judgeChange = "judgeChangeParams_shortName" size="small" v-model="departmentForm.departmentShortName" placeholder="请输入部门简称"></el-input>
			</el-form-item>
			<el-form-item label="排序编号" prop="orderNo">
				<el-input size="small" v-model="departmentForm.orderNo" placeholder="请输入排序编号"></el-input>
			</el-form-item>
			<el-form-item label="法定名称" prop="departmentLegalName">
			 	<el-input size="small" v-model="departmentForm.departmentLegalName" placeholder="请输入法定名称"></el-input>
			</el-form-item>
			<el-form-item label="负责人" prop="departmentManagerName">
				<el-select
					 v-model="departmentForm.departmentManagerName"
					 filterable
					 remote
					 reserve-keyword
					 placeholder="请输入关键词"
					 :loading-text="searchTip"
					 :remote-method="remoteMethod"
					 :loading="loading"
					 @change="handleSelect"
					 clearable class="width200"
					 size="small">
					<el-option v-for="item in list" :key="item.value" :label="item.label" :value="item.value" :info="item.info"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="成立日期" prop="departmentBuildDate">
			 	<el-date-picker
			    	v-model="departmentForm.departmentBuildDate"
			      	type="date"
			      	placeholder="请选择成立日期"
			      	size="small"
			      	format="yyyy-MM-dd"
			      	value-format="yyyy-MM-dd HH:mm:ss"
			      	:picker-options="pickerOptions">
			    </el-date-picker>
			</el-form-item>
			<el-form-item label="部门性质" prop="departmentNature" requireMsg="请选择部门性质" trigger="change,blur">
				<el-select size="small" v-model="departmentForm.departmentNature" placeholder="请选择">
					<el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<!--<el-form-item label="详细地址" prop="address">
			 	<el-input size="small" class="width350" v-model="departmentForm.address" placeholder="请输入详细地址"></el-input>
			</el-form-item>-->
			<el-form-item label="备注" prop="remark">
				<el-input size="small" :maxlength=300 type="textarea" v-model="departmentForm.remark" placeholder="请输入备注"></el-input>
			</el-form-item>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button type="primary"  @click.native="formSubmit" size="medium">确 定</el-button>
		    <el-button @click="closeHandle" size="medium">取 消</el-button>
		</span>
	</el-dialog>
</template>

<script>
import {
  departmentAdd,
  fetchOrgDetail,
  departmentEdit,
  searchUserFetch,
  getDetail,
  autoMakeMassage
} from "@/api/system/organize-element-tree";
export default {
  directives: {
    judgeChange: {
      inserted(el, params, vnode, oldVnode) {
        el.querySelector(".el-input__inner").onblur = function() {
          let val = eval("vnode.context." + params.value.val);
          let preVal = eval("vnode.context." + params.value.preVal);
          if (!val || val === preVal) {
            eval("vnode.context." + params.value.flag + " = false");
          } else if (val !== preVal) {
            eval("vnode.context." + params.value.flag + " = true");
          }
        };
      }
    }
  },
  props: {
    type: {
      type: [String]
    },
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
    parentNodeInfo: {
      type: Object,
      default() {
        return {
          organizationName: "",
          organizationId: ""
        };
      }
    },
    editInfo: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      modalAppendToBody:false,
      closeOnClickModal:false,
      judgeChangeParams_code: {
        flag: "judgeChange_code",
        preVal:"departmentCode_preVal",
        val: "departmentForm.departmentCode"
      },
      judgeChangeParams_shortName: {
        flag: "judgeChange_shortName",
        preVal:"departmentShortName_preVal",
        val: "departmentForm.departmentShortName"
      },
      judgeChange_code: false,
      judgeChange_shortName: false,
      loading: false,
      searchTip: "搜索数据中...",
      title: "",
      list: [],
      title: "",
      pickerOptions: {},
      //部门性质
      departmentOptions: [
        {
          label: "物业服务中心",
          value: 0
        },
        {
          label: "集团职能中心",
          value: 1
        }
      ],
      departmentForm: {
        //部门表单
        parentOrganizationName: "",
        parentOrganizationId: "",
        departmentCode: "",
        departmentShortName: "",
        departmentType: "1",
        departmentLegalName: "",
        departmentManagerId: "0",
        departmentManagerName: "",
        departmentBuildDate: "",
        departmentNature: "",
        address: "",
        organizationId: "",
        departmentId: "",
        departmentName: "",
        orderNo: "",
        remark: ""
      },
      rules: {
        departmentName: [
          { required: true, message: "请输入部门名称", trigger: "blur" }
        ],
        departmentShortName: [
          { required: true, message: "请输入部门简称", trigger: "blur" }
        ],
        // departmentBuildDate: [
        //   { required: true, message: "请选择成立日期", trigger: "blur" }
        // ],
        departmentNature: [
          { required: true, message: "请选择部门性质", trigger: "change" }
        ],
      }
    };
  },
  methods: {
    // 自动生成简称与编号
    autoMakeMassage() {
      if (this.departmentForm.departmentName) {
        autoMakeMassage({
          parentOrgId: this.departmentForm.parentOrganizationId,
          currentOrgName: this.departmentForm.departmentName
        }).then(res => {
          console.log("===============================")
          console.log(res)
          if (!this.judgeChange_shortName || !this.judgeChange_code) {
            const idata = res.resultData;
            if (!this.judgeChange_shortName) {
              this.departmentForm.departmentShortName = idata.shortName;
              this.departmentShortName_preVal = this.departmentForm.departmentShortName;
            }
            if (!this.judgeChange_code) {
              this.departmentForm.departmentCode = idata.code;
              this.departmentCode_preVal = this.departmentForm.departmentCode;
            }
          }
        });
      }
    },
    resetForm() {
      //==表单重置
      this.$refs["departmentForm"].resetFields();
    },
    formSubmit() {
      //==表单提交
      this.$refs["departmentForm"].validate(valid => {
        if (valid) {
          if (this.type === "edit") {
            //编辑保存
            departmentEdit(this.departmentForm).then(r => {
              this.$message({
                message: "保存成功",
                type: "success"
              });
              this.$emit("query");
              this.visible.visible = false;
            });
          } else if (this.type === "add") {
            //新增保存
            departmentAdd(this.departmentForm).then(r => {
              this.$message({
                message: "保存成功",
                type: "success"
              });
              this.$emit("query");
              this.visible.visible = false;
            });
          }
        }
      });
    },
    fetchEditData() {
      //==编辑信息
      fetchOrgDetail({
        organizationId: this.nodeInfo.organizationId
      }).then(r => {
        this.departmentForm = r.resultData.department;
      });
    },
    dialogClose() {
      this.resetForm();
    },
    closeHandle() {
      //==取消
      this.resetForm();
      this.visible.visible = false;
    },
    //模糊查询
    remoteMethod(query) {
      if (query != "" && query != " ") {
        this.loading = true;
        searchUserFetch({
          userName: query
        })
          .then(r => {
            this.loading = false;
            this.list = this.listHandle(r.resultData);
          })
          .catch(err => {
            this.searchTip = "服务器出错";
          });
      } else {
        this.list = [];
      }
    },
    listHandle(data) {
      return data.map((value, index, array) => {
        return {
          label: value.userName,
          value: value.userId,
          info: value
        };
      });
    },
    //选择人员回调
    handleSelect(item) {
      if (item) {
        for (let i = 0, val; (val = this.list[i]); i++) {
          if (val.value === item) {
            this.departmentForm.departmentManagerId = val.value;
            this.departmentForm.departmentManagerName = val.label;
            break;
          } else {
            this.departmentForm.departmentManagerId = "0";
            this.departmentForm.departmentManagerName = "";
          }
        }
      } else {
        this.departmentForm.departmentManagerId = "0";
        this.departmentForm.departmentManagerName = "";
      }
    },
    //新增的时候获取父节点
    getNodeFullName() {
      getDetail({ organizationId: this.parentNodeInfo.organizationId })
        .then(res => {
          this.departmentForm.parentOrganizationName = res.resultData
            ? res.resultData
            : this.parentNodeInfo.organizationName;
        })
        .catch(() => {
          this.departmentForm.parentOrganizationName = this.parentNodeInfo.organizationName;
        });
    }
  },
  created() {
    if (this.type === "add") {
      this.title = "新建子部门";
      this.getNodeFullName();
      this.departmentForm.parentOrganizationId = this.parentNodeInfo.organizationId;
    } else {
      this.title = "部门编辑";
      this.fetchEditData();
    }
  },
  updated() {}
};
</script>

<style rel="stylesheet/less" lang="scss">
@import "../../../../../assets/css/Modular/invariable-form/invariable-form.scss";
.win .ns-container #add-or-edit-department {
  .el-dialog {
    width: 650px;
  }
  .el-input {
    width: 200px;
  }
  div.el-dialog__body {
    max-height: 550px;
    overflow-y: auto;
  }
  div.el-dialog__body::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .el-textarea__inner {
    width: 350px;
  }
  .width350 {
    width: 350px;
  }
}
</style>
