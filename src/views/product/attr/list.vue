<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>
    <el-card>
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom: 20px"
          @click="addAttr"
          :disabled="!category3Id"
          >添加属性</el-button
        >
        <el-table border :data="attrs">
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            label="属性名称"
            width="150"
            prop="attrName"
          ></el-table-column>
          <el-table-column label="属性值列表">
            <template slot-scope="{ row, $index }">
              <el-tag
                style="margin: 2px"
                type="info"
                v-for="value in row.attrValueList"
                :key="value.id"
                >{{ value.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="primary"
                icon="el-icon-edit"
                size="mini"
                title="修改"
                @click="showUpdate(row)"
              ></HintButton>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">
        <el-form inline :model="attr">
          <el-form-item label="属性名">
            <el-input
              type="text"
              placeholder="请输入属性名"
              v-model="attr.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attr.attrName"
          @click="addAttrValue"
          >添加属性值
        </el-button>
        <el-button @click="isShowList = true">取消</el-button>
        <el-table border style="margin: 20px 0" :data="attr.attrValueList">
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{ row, $index }">
              <el-input
                size="mini"
                placeholder="请输入属性值名称"
                v-model="row.valueName"
                v-if="row.edit"
                @blur="toShow(row)"
                @keyup.enter.native="toShow(row)"
              ></el-input>
              <span v-else @click="toEdit(row)">{{ row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <HintButton
                title="删除"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteValue($index)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AttrList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrs: [], // 所有属性的列表
      isShowList: true, // 是否显示属性列表页面   true: 列表页面, false: 添加或更新页面
      attr: {
        // 要添加或者修改的平台属性对象
        attrName: "", // 属性名
        attrValueList: [], //属性值的列表
        categoryId: "", // 3级的分类ID
        categoryLevel: 3 // 只能是3级
      }
    };
  },
  //属性值对象： {"attrId": 0,"id": 0,"valueName": "string"}
  //  edit: true 添加新属性值是编辑模式  false:查看模式
  methods: {
    deleteValue(index) {
      this.attr.attrValueList.splice(index, 1);
    },
    // 将指定属性值对象变为编辑模式
    toEdit(value) {
      if (value.hasOwnProperty("edit")) {
        value.edit = true;
      } else {
        this.$set(value, "edit", true); //双向数据绑定增加属性要通过$set（）
      }
    },
    // 将指定属性值对象变为查看模式
    toShow(value) {
      // 必须输入属性值，并且与原来的属性值不重复
      if (value.valueName) {
        const isRepeat = this.attr.attrValueList.some((item, index) => {
          if (value !== item) {
            return item.valueName === value.valueName;
          }
        });
        if (!isRepeat) {
          value.edit = false;
        } else {
          value.valueName = "";
          this.$message.warning("输入的名称已存在");
        }
      }
    },
    // 显示修改属性的界面
    showUpdate(attr) {
      this.attr = attr;
      this.isShowList = false;
    },
    // 显示添加属性的界面
    addAttr() {
      this.attr = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3
      };
      this.isShowList = false;
    },
    // 添加属性值
    addAttrValue() {
      this.attr.attrValueList.push({
        attrId: this.attr.id,
        valueName: "",
        edit: true //添加新属性值是编辑模式
      });
    },

    // 3个级别分类发生改变时的监听回调
    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.attrs = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.attrs = [];
      } else {
        this.category3Id = categoryId;
        this.getAttrs();
      }
    },
    // 异步请求获取属性列表
    async getAttrs() {
      const { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      this.attrs = result.data;
    }
  },
  mounted() {
    this.category1Id = 2;
    this.category2Id = 13;
    this.category3Id = 61;
    this.getAttrs();
  }
};
</script>

<style scoped>
.edit-input {
  padding-right: 60px;
}
.save-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
