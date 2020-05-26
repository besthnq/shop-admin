<template>
  <div>
    <el-card class="sku-list">
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
              @click="showSkuInfo(row.id)"
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
      <el-drawer
        :visible.sync="isShowSkuInfo"
        direction="rtl"
        :withHeader="false"
        size="50%"
      >
        <el-row>
          <el-col :span="5">名称</el-col>
          <el-col :span="16">{{ skuInfo.skuName }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">描述</el-col>
          <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">价格</el-col>
          <el-col :span="16">{{ skuInfo.price }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="5">平台属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 5px"
              v-for="value in skuInfo.skuAttrValueList"
              :key="value.id"
            >
              {{ value.attrId + "-" + value.valueId }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">销售属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 5px"
              v-for="value in skuInfo.skuSaleAttrValueList"
              :key="value.id"
            >
              {{ value.id + "-" + value.saleAttrValueId }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">商品图片</el-col>
          <el-col :span="16">
            <el-carousel
              class="img-carousel"
              trigger="click"
              height="400px"
              :autoplay="false"
            >
              <el-carousel-item
                v-for="item in skuInfo.skuImageList"
                :key="item.id"
              >
                <img :src="item.imgUrl" alt="" />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
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
      skuInfo: {},
      isShowSkuInfo: false
    };
  },
  methods: {
    handleClose(close) {
      this.skuInfo = {};
      this.isShowSkuInfo = false;
    },
    // 查看sku详情
    async showSkuInfo(id) {
      this.isShowSkuInfo = true;
      const result = await this.$API.sku.get(id);
      this.skuInfo = result.data;
    },
    // 删除sku
    async deleteSku(skuId) {
      const result = await this.$API.sku.remove(skuId);
      if (result.code === 200) {
        this.$message.success("删除成功~~");
        this.getSkuList(this.page);
      } else {
        this.$message.error(result.data || result.message || "删除SKU失败");
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
      const result = await this.$API.sku.getList(this.page, this.limit);
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

<style lang="scss" scoped>
/* 1. 为什么加了/deep/就可以? 2. 为什么el-row/el-col不需要加? */
/*
问题1:
有scoped, 没有/deep/: .sku-list .img-carousel .el-carousel__indicator button[data-xxx]
加上/deep/: .sku-list[data-xxx] .img-carousel .el-carousel__indicator button
问题2:
  子组件的根标签有我当前组件的data属性, 而el-row / el-col没有子标签, 只有根标签, 改的就是根标签

结论: 如果是去修改UI组件的的内部根标签不需要要深度选择器主可以修改, 比如: el-row/el-col
      如果是去修改UI组件的内部子标签需要加深度选择器才可以修改, 比如: Carousel的指示器样式
*/
.sku-list {
  .el-row {
    height: 40px;
    .el-col {
      line-height: 40px;
      &.el-col-5 {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-right: 20px;
      }
    }
  }
  .img-carousel {
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 100%;
      height: 100%;
    }

    /deep/ .el-carousel__indicator {
      button {
        /* 所有指示按钮的样式 */
        width: 8px;
        height: 8px;
        display: inline-block;
        border-radius: 100%;
        background-color: hotpink;
      }
      &.is-active {
        button {
          /* 选中的按钮的样式 */
          background-color: green;
        }
      }
    }
  }
}
</style>
