<template>
  <!--查询表单-->

  <el-form :inline="true" :model="cForm" class="demo-form-inline">
    <el-form-item label="一级分类">
      <el-select
        v-model="cForm.category1Id"
        placeholder="选择一级分类"
        @change="handleChange1"
        :disabled="disabled"
      >
        <el-option
          :label="c.name"
          :value="c.id"
          v-for="c in category1List"
          :key="c.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select
        v-model="cForm.category2Id"
        placeholder="选择二级分类"
        @change="handleChange2"
        :disabled="disabled"
      >
        <el-option
          :label="c.name"
          :value="c.id"
          v-for="c in category2List"
          :key="c.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="选择三级分类">
      <el-select
        v-model="cForm.category3Id"
        placeholder="选择三级分类"
        @change="handleChange3"
        :disabled="disabled"
      >
        <el-option
          :label="c.name"
          :value="c.id"
          v-for="c in category3List"
          :key="c.id"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      disabled: false,
      // 查询表单数据
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: ""
      },
      category1List: [], // 一级分类列表
      category2List: [], // 二级分类列表
      category3List: [] // 三级分类列表
    };
  },

  mounted() {
    this.getCategory1List();
  },
  methods: {
    // 获取一级分类列表
    async getCategory1List() {
      const result = await this.$API.category.getCategorys1();
      this.category1List = result.data;
    },
    // 点击一级分类回调，获取二级分类列表
    async handleChange1(category1Id) {
      this.cForm.category2Id = "";
      this.cForm.category3Id = "";
      this.category2List = [];
      this.category3List = [];
      const result = await this.$API.category.getCategorys2(category1Id);
      this.category2List = result.data;
      this.$emit("categoryChange", { categoryId: category1Id, level: 1 });
    },

    // 点击二级分类回调，获取三级分类列表
    async handleChange2(category2Id) {
      this.cForm.category3Id = "";
      this.category3List = [];
      const result = await this.$API.category.getCategorys3(category2Id);
      this.category3List = result.data;
      this.$emit("categoryChange", { categoryId: category2Id, level: 2 });
    },
    // 点击三级分类回调，
    async handleChange3(category3Id) {
      this.$emit("categoryChange", { categoryId: category3Id, level: 3 });
    }
  }
};
</script>
<style></style>
