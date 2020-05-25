<template>
  <el-form label-width="100px">
    <el-form-item label="SPU 名称">
      <span>{{ spu.spuName }}</span>
    </el-form-item>

    <el-form-item label="SKU 名称">
      <el-input
        type="text"
        placeholder="SKU 名称"
        v-model="skuInfo.skuName"
      ></el-input>
    </el-form-item>

    <el-form-item label="价格">
      <el-input
        type="number"
        placeholder="SKU 价格"
        v-model="skuInfo.price"
      ></el-input>
    </el-form-item>

    <el-form-item label="重量(千克)">
      <el-input
        type="number"
        placeholder="SKU 重量"
        v-model="skuInfo.weight"
      ></el-input>
    </el-form-item>

    <el-form-item label="规格描述">
      <el-input
        type="textarea"
        placeholder="SKU 规格描述"
        rows="4"
        v-model="skuInfo.skuDesc"
      ></el-input>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form inline label-width="100px">
        <el-form-item
          :label="attr.attrName"
          style="margin: 5px"
          v-for="attr in attrList"
          :key="attr.id"
        >
          <el-select v-model="attr.attrIdValueId">
            <el-option
              :label="val.valueName"
              :value="attr.id + ':' + val.id"
              v-for="val in attr.attrValueList"
              :key="val.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form inline label-width="100px">
        <el-form-item
          :label="attr.saleAttrName"
          style="margin: 5px"
          v-for="attr in spuSaleAttrList"
          :key="attr.id"
        >
          <el-select v-model="attr.saleAttrValueId">
            <el-option
              :label="val.saleAttrValueName"
              :value="val.id"
              v-for="val in attr.spuSaleAttrValueList"
              :key="val.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table
        border
        :data="spuImageList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>

        <el-table-column label="图片">
          <template slot-scope="{ row, $index }">
            <img :src="row.imgUrl" alt="" style="width:100px;height:100px;" />
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="imgName"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <el-tag v-if="row.isDefault === '1'" type="success">默认</el-tag>
            <el-button
              v-else
              type="primary"
              size="mini"
              @click="setDefaultImg(row)"
              >设为默认</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {},
      skuInfo: {
        category3Id: "",
        spuId: "",
        tmId: "",

        skuName: "",
        price: "",
        skuDesc: "",
        weight: "",
        skuAttrValueList: [], //平台属性
        skuSaleAttrValueList: [], //销售属性
        skuImageList: [], //图片列表
        skuDefaultImg: "" //默认图片路径
      },
      attrList: [], //属性列表
      spuImageList: [], //spu图片列表
      spuSaleAttrList: [], //spu销售属性列表
      selectedSpuImageList: [] //选中的图片列表
    };
  },

  methods: {
    //
    async save() {
      const { attrList, selectedSpuImageList, spuSaleAttrList, skuInfo } = this;

      skuInfo.skuAttrValueList = attrList.reduce((prev, attr) => {
        if (attr.attrIdValueId) {
          const [attrId, valueId] = attr.attrIdValueId.split(":");
          prev.push({
            attrId,
            valueId
          });
        }
        return prev;
      }, []);

      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, attr) => {
        if (attr.saleAttrValueId) {
          prev.push({ saleAttrValueId: attr.saleAttrValueId });
        }
        return prev;
      }, []);

      skuInfo.skuImageList = selectedSpuImageList.map(value => ({
        imgName: value.imgName,
        imgUrl: value.imgUrl,
        spuImgId: value.id,
        isDefault: value.isDefault
      }));

      const result = await this.$API.sku.addUpdate(skuInfo);
      if (result.code === 200) {
        this.$message.success("保存成功~~");
        this.resetData();
        this.$emit("saveSuccess");
      } else {
        this.$message.error("保存失败！！");
      }
    },
    //设置默认照片
    setDefaultImg(img) {
      // console.log(row);
      this.spuImageList.forEach(item => (item.isDefault = "0"));
      img.isDefault = "1";
      // 保存默认图片路径
      this.skuInfo.skuDefaultImg = img.imgUrl;
    },
    // 表格中选中图片的回调函数
    handleSelectionChange(value) {
      this.selectedSpuImageList = value;
    },
    // 初始化
    initLoadAddData(spu) {
      this.spu = spu;
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.spuId;
      this.skuInfo.tmId = spu.tmId;
      this.getData();
    },
    //获取数据
    async getData() {
      //获取属性列表
      const { category1Id, category2Id, category3Id, id } = this.spu;
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      //获取spu图片列表
      const promise2 = this.$API.sku.getSpuImageList(id);
      //获取spu销售属性列表
      const promise3 = this.$API.sku.getSpuSaleAttrList(id);

      const results = await Promise.all([promise1, promise2, promise3]);
      // console.log(results);
      this.attrList = results[0].data;
      this.spuImageList = results[1].data.map(img => ({
        ...img,
        isDefault: "0"
      }));
      this.spuSaleAttrList = results[2].data;
    },
    back() {
      this.resetData();
      this.$emit("cancel");
    },
    //重置数据
    resetData() {
      this.skuInfo = {
        category3Id: "",
        spuId: "",
        tmId: "",
        skuName: "",
        skuDesc: "",
        price: "",
        weight: "",
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: []
      };

      this.spu = {}; // 所属的SPU对象
      this.attrList = []; // 平台属性列表
      this.spuImageList = []; // SPU的图片列表
      this.spuSaleAttrList = []; // SPU的销售属性列表
      this.selectedImageList = []; // 所有选中图片对象的列表
    }
  }
};
</script>

<style></style>
