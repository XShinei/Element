<template>
    <div>
        <!-- <el-pagination layout="total,pager" :total="107" :current-page="1"></el-pagination>
        <el-button type="success" size="small" plain disabled loading @click="handleClick">按钮</el-button> -->
        <!-- <el-input type="text" 
                    size="small" 
                    prefix-icon="el-icon-date" 
                    suffix-icon="el-icon-date" 
                    style="width: 500px;" 
                    :autosize="{minRows: 2, maxRows: 4}" 
                    resize="none" :value="value">
            <template slot="prepend">Http://</template>
            <template slot="append">.com</template>
        </el-input> -->
        <!-- <el-select :value="value"></el-select> -->
        <el-tag hit closeable>标签</el-tag>
    </div>
</template>

<script>
    import ElPagination from './packages/pagination/index.js';
    import ElButton from './packages/button/index.js';
    import ElInput from './packages/input/index.js';
    import ElSelect from './packages/select/index.js';
    import ElTag from './packages/tag/index.js';

    export default {
        components: {
            ElPagination,
            ElButton,
            ElInput,
            ElSelect,
            ElTag
        },
        methods: {
            handleClick() {
                this.$refs.input.select();
            }
        },
        data() {
            return {
                value: '123'
            };
        }
    }
</script>