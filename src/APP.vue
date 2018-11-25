<template>
    <div>
        <!-- <el-pagination layout="total,pager" :total="107" :current-page="1"></el-pagination>
        <el-button type="success" size="small" plain disabled loading @click="handleClick">按钮</el-button> -->
        <el-input size="small" prefix-icon="el-icon-date" suffix-icon="el-icon-date">
            <template slot="prepend">Http://</template>
            <template slot="append">.com</template>
        </el-input>
        <!-- <input type="text" @compositionstart="handleStart" 
                @compositionupdate="handleUpdate" 
                @compositionend="handleEnd" 
                @input="handleInput"> -->
    </div>
</template>

<script>
    import ElPagination from './packages/pagination/index.js';
    import ElButton from './packages/button/index.js';
    import ElInput from './packages/input/index.js';

    export default {
        components: {
            ElPagination,
            ElButton,
            ElInput
        },
        methods: {
            handleClick() {
                console.log(1);
            },
            handleStart() {
                console.log('start');
            },
            handleUpdate() {
                console.log('update');
            },
            handleEnd() {
                console.log('end');
            },
            handleInput() {
                console.log('input');
            }
        }
    }
</script>