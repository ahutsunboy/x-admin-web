import request from '@/utils/request'

export default{
  //根据查询条件获取用户列表数据的封装axois方法
  getRoleList(searchData){
    return request({
      url: '/role/list',
      method: 'get',     //get必须打上单引号，否则这个方法是都是失效的
      params: {
        roleName: searchData.roleName,
        phone: searchData.phone,
        pageNo: searchData.pageNo,
        pageSize: searchData.pageSize
      }
    })
  },

  //新增用户提交表单信息
  addRole(roleForm){
    return request({
      url: '/role',
      method: 'post',
      data: roleForm
    });
  },

  //根据id查询用户信息
  getRoleById(id){
   return request({
    url: `/role/${id}`,
    method: 'get'
   });   
  },

  //修改用户信息
  updateRole(role){
    return request({
      url: '/role',
      method: 'put',
      data: role
    });
  },

  //保存用户，选择调用新增还是修改方法
  saveRole(role){
    if(role.roleId==null ||role.roleId == undefined){
      return this.addRole(role);
    }else{
      return this.updateRole(role);
    }
  },

  //删除用户信息
  deleteRole(role){
    return request({
      url: `/role/${role.roleId}`,
      method: 'delete',
    });
  },


  getAllRole(){
    return request({
     url: '/role/allRole',
     method: 'get'
    });   
   }

}