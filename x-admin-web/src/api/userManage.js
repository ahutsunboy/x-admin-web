import request from '@/utils/request'

export default{
  //根据查询条件获取用户列表数据的封装axois方法
  getUserList(searchData){
    return request({
      url: '/user/list',
      method: 'get',     //get必须打上单引号，否则这个方法是都是失效的
      params: {
        username: searchData.username,
        phone: searchData.phone,
        pageNo: searchData.pageNo,
        pageSize: searchData.pageSize
      }
    })
  },

  //新增用户提交表单信息
  addUser(userForm){
    return request({
      url: '/user',
      method: 'post',
      data: userForm
    });
  },

  //根据id查询用户信息
  getUserById(id){
   return request({
    url: `/user/${id}`,
    method: 'get'
   });   
  },

  //修改用户信息
  updateUser(user){
    return request({
      url: '/user',
      method: 'put',
      data: user
    });
  },

  //保存用户，选择调用新增还是修改方法
  saveUser(user){
    if(user.id==null ||user.id == undefined){
      return this.addUser(user);
    }else{
      return this.updateUser(user);
    }
  },

  //删除用户信息
  deleteUser(user){
    return request({
      url: `/user/${user.id}`,
      method: 'delete',
    });
  }

}