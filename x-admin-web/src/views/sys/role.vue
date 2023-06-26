<template>
    <div>
      <!-- 搜索栏 -->
      <el-card id="search">
        <el-row>
          <el-col :span="20">
            <el-input
              v-model="searchData.roleName"
              placeholder="请输入用户角色"
              clearable
            ></el-input>
           
            <el-button
              type="primary"
              round
              icon="el-icon-search"
              @click="getRoleList"
              >查询</el-button
            >
          </el-col>
          <el-col :span="4" align="right">
            <span style="color: #409eff; margin: 10px">新增角色</span>
            <el-button
              type="primary"
              icon="el-icon-plus"
              circle
              @click="openEditUI(null)"
            ></el-button>
          </el-col>
        </el-row>
      </el-card>
  
      <!-- 列表栏 -->
      <el-card>
        <el-table :data="roleList" stripe style="width: 100%" >
          <!-- prop属性值是上面roleList数据中的属性 -->
          <el-table-column label="#" width="100">
            <template slot-scope="scope">
              {{
                (searchData.pageNo - 1) * searchData.pageSize + scope.$index + 1
              }}
            </template>
          </el-table-column>
          <el-table-column prop="roleId" label="用户ID" width="180">
          </el-table-column>
          <el-table-column prop="roleName" label="用户名" width="280">
          </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述">
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditUI(scope.row.roleId)" circle ></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row)" circle></el-button>
            </template>  
          </el-table-column>
       
        </el-table>
      </el-card>
  
      <!-- 分页组件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchData.pageNo"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
  
      <!-- 对话框 -->
      <el-dialog
        @close="clearRoleForm"
        :title="title"
        :visible.sync="dialogFormVisible"
      >
        <el-form :model="roleForm" :rules="rules" ref="roleFormRef">
          <el-form-item label="角色名称:" :label-width="formLabelWidth" prop="roleName">
            <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色描述:" :label-width="formLabelWidth" prop="roleDesc">
            <el-input v-model="roleForm.roleDesc" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="权限设置:" :label-width="formLabelWidth" prop="menuIdList">
            <el-tree :data="menuList" :props="menuProps" show-checkbox default-expand-all
            style="width: 80%;" node-key="menuId" ref="menuRef"></el-tree>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRole">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  

  <script>
  import roleManage from "@/api/roleManage.js";
  import menuManage from "@/api/menuManage.js";
  
  export default {
    data() {
      return {
        rules: {
          roleName: [
              { required: true, message: '请输入角色名称', trigger: 'blur' },
              { min: 2, max: 15, message: '角色名称长度应在 2 到 15 个位', trigger: 'blur' }
            ],
            roleDesc: [
              { required: true, message: '请输入角色描述', trigger: 'blur' },
              { min: 2, max: 15, message: '角色描述长度应在 2 到 15 个位', trigger: 'blur' }
            ]
          },
        //给编辑页表单赋初值
        title: "",
        dialogFormVisible: false,
        formLabelWidth: "150px", //设置表单左边距离边界宽度
        roleForm: {},
  
        //分页查询有关数据赋初值
        total: 0,
        searchData: {
          pageNo: 1,
          pageSize: 10,
        },
        roleList: [],

        menuList:[],
        menuProps:{
          children: 'children',
          label: 'title'
        }

      };
    },
    methods: {
      getAllMenu(){
        menuManage.getAllMenu().then((response)=>{
          this.menuList=response.data;
        })
      },
      handleSizeChange(pageSize) {
        this.searchData.pageSize = pageSize;
        this.getRoleList();
      },
      handleCurrentChange(pageNo) {
        this.searchData.pageNo = pageNo;
        this.getRoleList();
      },
      getRoleList() {
        roleManage.getRoleList(this.searchData).then((response) => {
          this.roleList = response.data.rows;
          this.total = response.data.total;
        });
      },
      openEditUI(operate){
        if(operate==null){
          this.title = "新增角色";
        }else{
          this.title = "修改信息";
          roleManage.getRoleById(operate).then(res=>{
            this.roleForm=res.data;
            this.$refs.menuRef.setCheckedKeys(res.data.menuIdList);
          })
        }
          this.dialogFormVisible = true;
      },
      //清空编辑表单的数据和验证信息
      clearRoleForm(){
          this.roleForm={};
          this.$refs.roleFormRef.clearValidate();
          this.$refs.menuRef.setCheckedKeys([]);
      },
      saveRole(){
          //提交前先检验数据
          this.$refs.roleFormRef.validate((valid) => {
            //验证通过
            if (valid) {
              //获取树形控件的被选择的序号的数组
              let checkedKeys = this.$refs.menuRef.getCheckedKeys();
              let halfCheckedKeys = this.$refs.menuRef.getHalfCheckedKeys();
              this.roleForm.menuIdList = checkedKeys.concat(halfCheckedKeys);
              //提交表单
              roleManage.saveRole(this.roleForm).then(res=>{
                //弹框提示
                this.$message({
                  message: res.message,
                  type: 'success'
                });
              //关闭窗口
              this.dialogFormVisible=false;
              //刷新数据
              this.getRoleList();
            });
            } else {
              console.log('error submit!!');
              return false;
            }
          });        
      },
      deleteRole(role){
        this.$confirm(`确定删除用户${role.roleName}吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            roleManage.deleteRole(role).then(res=>{
              this.$message({
              type: 'success',
              message: res.message
            });
            this.getRoleList();
            });
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });          
          });
      }   
    },
    created() {
      this.getRoleList();
      this.getAllMenu();
    },
  };
  </script>
  
  <!--此处的id选项器后面必须有一个空格才能生效  -->
  <style>
  #search .el-input {
    width: 250px;
    margin-right: 10px;
  }
  
  .el-dialog .el-input {
    width: 80%;
  }
  </style>