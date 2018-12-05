<template>
    <ul class="el-select-group__wrap">
        <li class="el-select-group__title"></li>
        <li>
            <ul class="el-select-group">
                <slot></slot>
            </ul>
        </li>
    </ul>
</template>

<script>
    import Emitter from '../../../mixins/emitter';

    export default {
        name: 'ElOptionGroup',

        componentName: 'ElOptionGroup',

        mixins: [Emitter],

        props: {
            label: String,

            disabled: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                visible: true
            };
        },

        created() {
            this.$on('queryChange', this.queryChange);
        },

        mounted() {
            // 若传入了 disabled 属性
            if (this.disabled) {
                // 通知所有 ElOption 后代组件，optionGroup父组件的禁用状态
                this.broadcast('ElOption', 'handleGroupDisabled', this.disabled);
            }
        },

        methods: {
            queryChange() {
                // 可见状态子组件ElOption的数目大于1，则该组件就是可见的
                this.visible = this.$children 
                && Array.isArray(this.$children) 
                && this.$children.some(option => option.visible === true);
            }
        },

        watch: {
            disabled(val) {
                // 通知所有 ElOption 后代组件，optionGroup父组件的禁用状态
                this.broadcast('ElOption', 'handleGroupDisabled', val);
            }
        }
    }
</script>