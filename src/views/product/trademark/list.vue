<template>
  <div>
    <el-button
      type="primary"
      icon="el-icon-plus"
      @click="showAdd"
      style="margin-bottom:20px"
      >添加</el-button
    >
    <el-table :data="trademarks" stripe border v-loading="loading">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称"> </el-table-column>
      <el-table-column label="姓名">
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" alt="" style="width:100px;height:60px;" />
        </template>
      </el-table-column>
      <el-table-column prop="address" label="操作">
        <template slot-scope="{ row, $index }">
          <el-button
            type="waring"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdate(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="form.id ? '更新' : '添加'" :visible.sync="isShowDialog">
      <el-form :model="form">
        <el-form-item label="品牌名称" :label-width="formLabelWidth">
          <el-input
            v-model="form.tmName"
            autocomplete="off"
            placeholder="请输入品牌名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <el-pagination
      background
      style="text-align: center; margin-top: 20px;"
      @size-change="handleSizeChange"
      @current-change="getTrademarks"
      :current-page="page"
      :page-sizes="[3, 6, 9, 12]"
      :page-size="limit"
      layout=" prev, pager, next, jumper, ->,sizes,total"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "TrademarkList",
  data() {
    return {
      loading: false,
      trademarks: [], //列表数据
      total: 0, //总页数
      page: 1, //当前页码
      limit: 3, //每页数量
      isShowDialog: false,
      form: {
        tmName: "",
        logoUrl: ""
      },
      formLabelWidth: "100px"
    };
  },
  mounted() {
    this.getTrademarks();
  },
  methods: {
    // 删除品牌
    deleteTrademark(trademark) {
      this.$confirm(`确定删除${trademark.tmName}么？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const result = await this.$API.trademark.remove(trademark.id);
          if (result.code === 200) {
            this.$message.success("删除成功~~");
            const page =
              this.trademarks.length === 1 ? this.page - 1 : this.page;
            this.getTrademarks(page);
          } else {
            this.$message.error("删除失败~~");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //更新品牌
    showUpdate(trademark) {
      this.form = trademark;
      this.isShowDialog = true;
    },
    // 添加或更新品牌
    async addOrUpdateTrademark() {
      const trademark = this.form;
      let result;
      if (trademark.id) {
        result = await this.$API.trademark.update(trademark);
      } else {
        result = await this.$API.trademark.add(trademark);
      }
      if (result.code === 200) {
        this.$message.success(`${trademark.id ? "更新" : "添加"}成功`);
        this.isShowDialog = false;
        this.form = { tmName: "", logoUrl: "" };
        this.getTrademarks(trademark.id ? this.page : 1);
      } else {
        this.$message.error(`${trademark.id ? "更新" : "添加"}失败`);
      }
    },
    // 图片上传成功
    handleLogoSuccess(res, file) {
      // console.log("111", res, file);

      this.form.logoUrl = res.data;
    },
    // 上传图片前的回调，返回false 不发送请求
    beforeLogoUpload(file) {
      const isJPGOrPNG = ["image/jpeg", "image/png"].indexOf(file.type) > -1;
      const isLt500KB = file.size / 1024 < 500;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是  JPG/PNG  格式!");
      }
      if (!isLt500KB) {
        this.$message.error("上传头像图片大小不能超过 500kb!");
      }
      return isJPGOrPNG && isLt500KB;
    },

    showAdd() {
      this.isShowDialog = true;
      this.form = { tmName: "", logoUrl: "" };
    },

    // 异步获取指定页码列表数据显示
    async getTrademarks(page = 1) {
      this.page = page;
      this.loading = true;
      const result = await this.$API.trademark.getList(page, this.limit);
      this.loading = false;
      if (result.code === 200) {
        const { records, total } = result.data;
        this.trademarks = records;
        this.total = total;
      } else {
        this.$message.error("获取品牌列表失败");
      }
    },
    // 每页显示数量改变
    handleSizeChange(val) {
      this.limit = val;
      this.getTrademarks();
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
