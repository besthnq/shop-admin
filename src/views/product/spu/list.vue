<template>
  <div>
    <el-card style="margin-bottom: 20px" v-show="!isShowSkuForm">
      <category-selector
        @categoryChange="handleCategoryChange"
        ref="cs"
      ></category-selector>
    </el-card>
    <el-card>
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom: 20px"
          @click="showAddSpu"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <el-table v-loading="loading" :data="spuList" border stripe>
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column label="SPU名称" prop="spuName"> </el-table-column>
          <el-table-column label="SPU描述" prop="description">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <hint-button
                title="添加SKU"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="showSkuAdd(row)"
              ></hint-button>
              <hint-button
                title="修改SPU"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdateSpu(row.id)"
              ></hint-button>
              <hint-button
                title="查看所有SKU"
                type="info"
                icon="el-icon-info"
                size="mini"
                @click="showSkuList(row)"
              ></hint-button>
              <el-popconfirm title="确定删除吗?" @onConfirm="deleteSpu(row.id)">
                <hint-button
                  slot="reference"
                  title="删除SPU"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                ></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          style="text-align: center; margin-top: 20px;"
          :current-page="page"
          :page-sizes="[3, 6, 9, 12]"
          :page-size="limit"
          layout="prev, pager, next, jumper, ->, sizes, total"
          :total="total"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        />
      </div>
      <!-- <SpuForm v-show="isShowSpuForm"></SpuForm> -->
      <SpuForm
        :visible.sync="isShowSpuForm"
        @save="handleSaveSuccess"
        @cancel="handleCancel"
        ref="spuForm"
      ></SpuForm>
      <SkuForm
        v-show="isShowSkuForm"
        @cancel="isShowSkuForm = false"
        @saveSuccess="isShowSkuForm = false"
        ref="skuForm"
      ></SkuForm>
    </el-card>

    <el-dialog :title="spuName + '->SKU列表'" :visible.sync="isShowSkuList">
      <el-table :data="skuList" border>
        <el-table-column prop="skuName" label="名称"></el-table-column>
        <el-table-column prop="price" label="价格(元)"></el-table-column>
        <el-table-column prop="weight" label="重量(KG)"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{ row, $index }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width:100px;height:100px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from "../components/spuForm";
import SkuForm from "../components/skuForm";
export default {
  name: "SpuList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 3,
      total: 0,
      loading: false,
      isShowSpuForm: false,
      isShowSkuForm: false,

      isShowSkuList: false,

      skuList: [],
      spuName: "",
      spu: {} // 要显示sku列表的spu
    };
  },
  watch: {
    isShowSpuForm(value) {
      this.$refs.cs.disabled = value;
    }
  },

  methods: {
    //pu保存成功地回调函数
    handleSaveSuccess() {
      this.getSpuList(this.spuId ? this.page : 1);
      this.spuId = null;
    },
    handleCancel() {
      // 重置更新的标识
      this.spuId = null;
    },

    //查看spu下的所有sku
    async showSkuList(spu) {
      this.spuName = spu.spuName;
      this.isShowSkuList = true;
      this.spu = spu;
      const result = await this.$API.sku.getListBySpuId(spu.id);
      this.skuList = result.data;
    },
    // 删除SPU
    async deleteSpu(id) {
      const result = await this.$API.spu.remove(id);
      if (result.code === 200) {
        this.$message.success("删除成功~~");
        this.getSpuList();
      } else {
        this.$message.error(result.data || result.message || "删除失败！！");
      }
    },
    // 显示SPU添加的表单界面
    showAddSpu() {
      this.isShowSpuForm = true;
      this.$refs.spuForm.initLoadAddData(this.category3Id);
    },
    // 显示SKU添加的表单界面
    showSkuAdd(spu) {
      this.isShowSkuForm = true;
      spu = { ...spu };
      spu.category1Id = this.category1Id;
      spu.category2Id = this.category2Id;
      this.$refs.skuForm.initLoadAddData(spu);
      // console.log(spu);
    },
    //显示SPU修改界面
    showUpdateSpu(id) {
      this.spuId = id;
      this.isShowSpuForm = true;
      // 通知SpuForm根据传入的ID请求获取初始显示需要的数据
      // 使用的是v-show来隐藏的, 隐藏时组件对象还在存在
      this.$refs.spuForm.initLoadUpdateData(id);
    },
    // 获取三级列表的回调函数
    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.total = 0;
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.spuList = [];
        this.total = 0;
      } else {
        this.category3Id = categoryId;

        this.getSpuList();
      }
    },
    // 请求获取分页列表数据
    async getSpuList(page = 1) {
      this.page = page;
      const { limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        const { records, total } = result.data;
        this.spuList = records;
        this.total = total;
      }
    },
    //获取指定页码数据
    handleSizeChange(pageSize) {
      this.limit = pageSize;
      this.getSpuList();
    }
  },
  mounted() {
    this.category1Id = 2;
    this.category2Id = 13;
    this.category3Id = 61;
    this.getSpuList();
  },
  components: {
    SpuForm,
    SkuForm
  }
};
</script>
