<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input
            v-model="searchData.username"
            placeholder="请输入用户名"
            clearable
          ></el-input>
          <el-input
            v-model="searchData.phone"
            placeholder="请输入手机号"
            clearable
          ></el-input>
          <el-button
            type="primary"
            round
            icon="el-icon-search"
            @click="getUserList"
            >查询</el-button
          >
        </el-col>
        <el-col :span="4" align="right">
          <span style="color: #409eff; margin: 10px">新增用户</span>
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
      <el-table :data="userList" stripe style="width: 100%" >
        <!-- prop属性值是上面userList数据中的属性 -->
        <el-table-column label="#" width="100">
          <template slot-scope="scope">
            {{
              (searchData.pageNo - 1) * searchData.pageSize + scope.$index + 1
            }}
          </template>
        </el-table-column>
        <el-table-column prop="id" label="用户ID" width="180">
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="180">
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="180">
        </el-table-column>
        <el-table-column prop="email" label="电子邮件" width="250"> </el-table-column>
        <el-table-column prop="status" label="激活状态" >
          <template slot-scope="scope">
            <!-- 使用scope获取每一行数据中对应的status值 -->
            <el-tag v-if="scope.row.status==1">已激活</el-tag> 
            <el-tag type="danger" v-else>未激活</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditUI(scope.row.id)" circle ></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row)" circle></el-button>
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
      @close="clearUserForm"
      :title="title"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="userForm" :rules="rules" ref="userFormRef">
        <el-form-item label="用户名:" :label-width="formLabelWidth" prop="username">
          <el-input v-model="userForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="userForm.id==null || userForm.id==undefined" label="密码:" :label-width="formLabelWidth" prop="password">
          <el-input type="password" v-model="userForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" :label-width="formLabelWidth" prop="email">
          <el-input v-model="userForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号:" :label-width="formLabelWidth" prop="phone">
          <el-input v-model="userForm.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户权限:" :label-width="formLabelWidth">
          <el-checkbox-group 
            v-model="userForm.roleIdList"
            :max="2"  
            style="width: 80%">
            <el-checkbox v-for="role in roleList" :label="role.roleId" :key="role.roleId">{{role.roleDesc}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="激活状态:" :label-width="formLabelWidth" prop="status">
          <el-switch
            v-model="userForm.status"
            inactive-text="不激活"
            :inactive-value="0"
            active-text="激活"
            :active-value="1"
          >
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userManage from "@/api/userManage.js";
import roleManage from "@/api/roleManage.js";
export default {
  name: "XAdminWebUser",
  data() {
    // 检验邮箱格式是否正确的自定义校验规则
    var checkEmail = (rule, value, callback) => {
        var reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

        if (!reg.test(value)) {
          return callback(new Error('邮箱格式不正确'));
        }
        callback();

      };
    return {
      rules: {
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 15, message: '用户名长度应在 2 到 15 个位', trigger: 'blur' }
          ],
        password: [
            { required: true, message: '请设置登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '密码长度应在 6 到 15 位', trigger: 'blur' }
          ],
        email: [
            { required: true, message: '请输入电子邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
        phone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { min: 11, max: 11, message: '请输入正确的手机号', trigger: 'blur' }
          ]
        },
      //给编辑页表单赋初值
      title: "",
      dialogFormVisible: false,
      formLabelWidth: "150px", //设置表单左边距离边界宽度
      userForm: {
        roleIdList:[],
      },

      //分页查询有关数据赋初值
      total: 0,
      searchData: {
        pageNo: 1,
        pageSize: 10,
      },
      userList: [],
      roleList:[]
    };
  },
  methods: {
    handleSizeChange(pageSize) {
      this.searchData.pageSize = pageSize;
      this.getUserList();
    },
    handleCurrentChange(pageNo) {
      this.searchData.pageNo = pageNo;
      this.getUserList();
    },
    getUserList() {
      userManage.getUserList(this.searchData).then((response) => {
        this.userList = response.data.rows;
        this.total = response.data.total;
      });
    },
    openEditUI(operate){
      if(operate==null){
        this.title = "新增用户";
      }else{
        this.title = "修改信息";
        userManage.getUserById(operate).then(res=>{
          this.userForm=res.data;
        })
      }
        this.dialogFormVisible = true;
    },
    //清空编辑表单的数据和验证信息
    clearUserForm(){
        this.userForm={
          roleIdList: [],
        };
        this.$refs.userFormRef.clearValidate();
    },
    saveUser(){
        //提交前先检验数据
        this.$refs.userFormRef.validate((valid) => {
          //验证通过
          if (valid) {
            //提交表单
            userManage.saveUser(this.userForm).then(res=>{
              //弹框提示
              this.$message({
                message: res.message,
                type: 'success'
              });
            //关闭窗口
            this.dialogFormVisible=false;
            //刷新数据
            this.getUserList();
          });
          } else {
            console.log('error submit!!');
            return false;
          }
        });        
    },
    deleteUser(user){
      this.$confirm(`确定删除用户${user.username}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          userManage.deleteUser(user).then(res=>{
            this.$message({
            type: 'success',
            message: res.message
          });
          this.getUserList();
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    getAllRole(){
      roleManage.getAllRole().then(res=>{
        this.roleList = res.data;
      })
    }   
  },
  created() {
    this.getUserList();
    this.getAllRole();
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