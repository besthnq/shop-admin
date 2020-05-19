// 品牌管理接口函数

import request from "@/utils/request";

const api_name = "/admin/product/baseTrademark";

export default {
  //GET /admin/product/baseTrademark/get/{id}  根据id获取对应的品牌
  getById(id) {
    return request.get(`/admin/product/baseTrademark/get/${id}`);
  },
  //  GET /admin/product/baseTrademark/getTrademarkList   获取所有品牌的列表
  //  GET /admin/product/baseTrademark/{page}/{limit}   获取品牌分页列表
  getList(page, limit) {
    if (page && limit) {
      return request(`/admin/product/baseTrademark/${page}/${limit}`);
    } else {
      return request(`/admin/product/baseTrademark/getTrademarkList `);
    }
  },
  //    DELETE /admin/product/baseTrademark/remove/{id}  根据id删除对应的品牌
  remove(id) {
    return request.delete(`/admin/product/baseTrademark/remove/${id}`);
  },

  //  POST /admin/product/baseTrademark/save  添加一个新的品牌
  add(trademark) {
    return request.post(`${api_name}/save`, trademark);
  },

  //   PUT /admin/product/baseTrademark/update  更新品牌
  update(trademark) {
    return request.put(`${api_name}/update`, trademark);
  }
};
