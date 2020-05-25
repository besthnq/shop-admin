<template>
  <div>
    <el-form label-width="100px" v-show="visible">
      <el-form-item label="SPU名称">
        <el-input
          type="text"
          placeholder="SPU名称"
          v-model="spuInfo.spuName"
        ></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="tm in trademarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          placeholder="SPU描述"
          rows="4"
          v-model="spuInfo.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          :file-list="spuImageList"
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
        >
          <i class="el-icon-plus"></i>
          <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过2M
          </div>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          :placeholder="
            unUsedSaleAttrList.length > 0
              ? `还有${unUsedSaleAttrList.length}个未使用`
              : '没有啦!!!'
          "
          v-model="attrIdAttrName"
        >
          <el-option
            :label="unAttr.name"
            :value="unAttr.id + `:` + unAttr.name"
            v-for="unAttr in unUsedSaleAttrList"
            :key="unAttr.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSpuAttr"
          :disabled="!attrIdAttrName"
          >添加销售属性</el-button
        >

        <el-table
          style="margin-top: 20px"
          border
          :data="spuInfo.spuSaleAttrList"
        >
          <!-- 序号列 -->
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>

          <el-table-column label="属性名" prop="saleAttrName">
          </el-table-column>
          <el-table-column label="属性值名称列表">
            <template slot-scope="{ row, $index }">
              <el-tag
                style="margin-right: 5px"
                v-for="(value, index) in row.spuSaleAttrValueList"
                :key="value.id"
                closable
                :disable-transitions="false"
              >
                {{ value.saleAttrValueName }}
              </el-tag>
              <el-input
                style="width: 100px"
                placeholder="请输入名称"
                class="input-new-tag"
                v-if="row.edit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              ></el-input>
              <el-button
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >+ 添加</el-button
              >
            </template>
          </el-table-column>

          <el-table-column prop="address" label="操作">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                title="确定删除吗?"
                @onConfirm="spuInfo.spuSaleAttrList.splice($index, 1)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  >删除</el-button
                >
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  props: {
    visible: Boolean
  },
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spuId: "", // 当前要更新的spuInfo的id
      spuInfo: {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList: [], // 销售属性初始数据
        spuImageList: [] //
      }, // 当前SpuInfo对象
      spuImageList: [], // Spu的图片列表
      trademarkList: [], //品牌列表
      saleAttrList: [], //销售属性列表
      attrIdAttrName: [] //点击添加属性时，收集属性id和name
    };
  },
  computed: {
    // 得到saleAttrList中还没有使用的属性的数组(与销售属性比较)
    unUsedSaleAttrList() {
      return this.saleAttrList.filter(attr =>
        this.spuInfo.spuSaleAttrList.every(
          spuAttr => spuAttr.saleAttrName !== attr.name
        )
      );
    }
  },
  methods: {
    // 保存SPU
    async save() {
      const { spuInfo, spuImageList } = this;

      spuInfo.spuSaleAttrList.filter(attr => {
        delete attr.edit;
        delete attr.saleAttrValueName;
        return attr.spuSaleAttrValueList.length > 0;
      });

      spuInfo.spuImageList = spuImageList.map(item => ({
        imgName: item.name,
        imgUrl: item.response ? item.response.data : item.url
      }));

      const result = await this.$API.spu.addUpdate(spuInfo);
      if (result.code === 200) {
        this.$message.success("保存SPU成功~~");
        this.$emit("update:visible", false);
        this.$emit("save");
      } else {
        this.$message.error("保存SPU失败！！");
      }
    },
    //添加属性值数据
    handleInputConfirm(spuSaleAttr) {
      const { saleAttrValueName, baseSaleAttrId } = spuSaleAttr;
      if (!saleAttrValueName) {
        spuSaleAttr.edit = false;
        return;
      }
      const result = spuSaleAttr.spuSaleAttrValueList.some(
        value => value.saleAttrValueName === saleAttrValueName
      );
      if (result) {
        this.$message.warning("属性值重复！！");
        return;
      }

      spuSaleAttr.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId
      });

      spuSaleAttr.edit = false;
      spuSaleAttr.saleAttrValueName = "";
    },
    //显示属性值输入框
    showInput(spuSaleAttr) {
      if (spuSaleAttr.hasOwnProperty("edit")) {
        spuSaleAttr.edit = true;
      } else {
        this.$set(spuSaleAttr, "edit", true);
      }
      this.$nextTick(() => this.$refs.saveTagInput.focus());
    },
    // 添加销售属性
    addSpuAttr() {
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(":");
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      });
      this.attrIdAttrName = "";
    },
    // 添加SPU界面初始化数据
    initLoadAddData(category3Id) {
      this.spuInfo.category3Id = category3Id;
      this.getTrademarkList();
      this.getSaleAttrList();
    },

    //更新SPU界面初始化数据
    initLoadUpdateData(spuId) {
      this.spuId = spuId;
      this.getSpuInfo();
      this.getSpuImageList();
      this.getTrademarkList();
      this.getSaleAttrList();
    },
    //根据SPU的id获取SPU的详情信息
    async getSpuInfo() {
      const result = await this.$API.spu.get(this.spuId);
      this.spuInfo = result.data;
    },

    //根据SPU的id获取SPU的图片列表
    async getSpuImageList() {
      const result = await this.$API.sku.getSpuImageList(this.spuId);
      result.data.forEach(item => {
        item.name = item.imgName;
        item.url = item.imgUrl;
      });
      this.spuImageList = result.data;
    },
    //获取所有品牌的列表
    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      this.trademarkList = result.data;
    },
    //获取所有销售属性(id/name)列表
    async getSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.saleAttrList = result.data;
    },

    //返回
    back() {
      this.$emit("update:visible", false);
    },
    // 图片
    handleRemove(file, fileList) {
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleSuccess(response, file, fileList) {
      this.spuImageList = fileList;
    }
  }
};
</script>

<style lang="less" scoped></style>
