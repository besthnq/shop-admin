<template>
  <div>
    <el-card>
      <el-table border stripe :data="skuList" v-loading="loading">
        <el-table-column
          type="index"
          label="序号"
          width="80"
          align="center"
          row-key="id"
        >
        </el-table-column>
        <el-table-column prop="skuName" label="名称" />

        <el-table-column prop="skuDesc" label="描述" />

        <el-table-column label="默认图片" width="150" align="center">
          <template slot-scope="{ row }">
            <img :src="row.skuDefaultImg" alt="商品图片" style="width: 80px;" />
          </template>
        </el-table-column>

        <el-table-column prop="weight" label="重量(KG)" />

        <el-table-column prop="price" label="价格(元)" width="80" />

        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="{ row, $index }">
            <HintButton
              title="上架"
              type="success"
              size="mini"
              icon="el-icon-top"
              v-if="row.isSale === 0"
              @click="onSale(row.id)"
            />

            <HintButton
              title="下架"
              type="warning"
              size="mini"
              icon="el-icon-bottom"
              v-if="row.isSale === 1"
              @click="cancelSale(row.id)"
            />

            <HintButton
              title="修改"
              type="primary"
              size="mini"
              icon="el-icon-edit"
            />

            <HintButton
              title="查看详情"
              type="primary"
              size="mini"
              icon="el-icon-info"
            />

            <el-popconfirm
              :title="`确定删除 ${row.skuName}  吗`"
              @onConfirm="deleteSku(row.id)"
            >
              <hint-button
                slot="reference"
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除"
              ></hint-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="page"
        :total="total"
        :page-size="limit"
        :page-sizes="[5, 10, 20, 30, 40, 50]"
        style="padding: 20px 0; text-align: center;"
        layout="prev, pager, next, jumper, ->, sizes, total"
        @current-change="getSkuList"
        @size-change="changeSize"
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SkuList",
  data() {
    return {
      skuList: [], //sku列表
      loading: false,
      total: 0,
      limit: 10,
      page: 1,
      skuInfo: {}
    };
  },
  methods: {
    // 删除sku
    async deleteSku(skuId) {
      const result = await this.$API.sku.deleteSku(skuId);
      if (result.code === 200) {
        this.$message.success("删除成功~~");
        this.getSkuList(this.page);
      }
    },
    // 上架
    async onSale(skuId) {
      const result = await this.$API.sku.onSale(skuId);
      if (result.code === 200) {
        this.$message.success("上架成功~~");
        this.getSkuList(this.page);
      }
    },
    // 下架
    async cancelSale(skuId) {
      const result = await this.$API.sku.cancelSale(skuId);
      if (result.code === 200) {
        this.$message.success("下架成功~~");
        this.getSkuList(this.page);
      }
    },
    // 获取sku列表
    async getSkuList(page = 1) {
      this.page = page;
      this.loading = true;
      const result = await this.$API.sku.getList(page, this.limit);
      if (result.code === 200) {
        this.skuList = result.data.records;
        this.total = result.data.total;
      }
      this.loading = false;
    },
    changeSize(pageSize) {
      this.limit = pageSize;
      this.getSkuList();
    }
  },
  mounted() {
    this.getSkuList();
  }
};
</script>
