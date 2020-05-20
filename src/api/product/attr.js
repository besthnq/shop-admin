//商品属性相关接口函数

import request from "@/utils/request";
export default {
  /*
  根据3级分类获取属性列表
  GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  */
  getList(category1Id, category2Id, category3Id) {
    return request.get(
      `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`
    );
  },

  /*
  根据ID删除对应的属性
  DELETE /admin/product/deleteAttr/{attrId}
  */

  remove(Id) {
    return request.delete(`/admin/product/deleteAttr/${Id}`);
  },

  /*
  根据属性id获取属性值列表
  GET /admin/product/getAttrValueList/{attrId}
  */
  getValueList(attrId) {
    return request(`/admin/product/getAttrValueList/${attrId}`);
  },
  /*
  添加/更新属性
  POST /admin/product/saveAttrInfo
  attrInfo如果有id那就是更新, 如果没有id那就是添加
  */
  addOrUpdate(attrInfo) {
    return request.post(`/admin/product/saveAttrInfo`, attrInfo);
  }
};
