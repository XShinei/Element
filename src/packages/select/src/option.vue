<template>
    <li @mouseenter="hoverItem" 
        @click.stop="selectOptionClick" 
        class="el-select-dropdown__item"
        :class="{
            'selected': itemSelected,
            'is-disabled': disabled || groupDisabled || limitReached,
            'hover': hover
        }" 
        v-show="visible"
    >
        <slot>
            <span>{{ currentLabel }}</span>
        </slot>
    </li>
</template>

<script>
    import { getValueByPath, escapeRegexpString } from '../../../utils/util';
    import Emitter from '../../../mixins/emitter';

    export default {
        name: 'ElOption',

        componentName: 'ElOption',

        mixins: [Emitter],

        inject: ['select'],

        props: {
            value: {            // 选项的值
                required: true
            },

            label: [String, Number],    // 选项的标签，若不设置则默认与value相同

            created: Boolean,

            disabled: {         // 是否禁用该选项
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                visible: true,
                groupDisabled: false,
                hover: false
            };
        },

        computed: {
            isObject() {
                return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]';
            },

            itemSelected() {
                if (!this.select.multiple) {
                    return this.isEqual(this.value, this.select.value);
                }
                else {
                    return this.contains(this.select.value, this.value);
                }
            },

            // 是否超出限制
            limitReached() {
                // 多选情况下
                // 当前选项未被选中 已选的选项数目超过预设的数目 multipleLimit大于0表示会限制
                if (this.select.multiple) {
                    return !this.itemSelected 
                    && (this.select.value || []).length >= this.select.multipleLimit
                    && this.select.multipleLimit > 0;
                }
                else {
                    return false;
                }
            },

            currentLabel() {
                return this.label || (this.isObject ? '' : this.value);
            },

            currentValue() {
                return this.value || this.label || '';
            }
        },

        created() {
            // 将当前组件实例存入 select组件的options、cachedOptions属性中
            this.select.options.push(this);
            this.select.cachedOptions.push(this);
            this.select.optionsCount++;
            this.select.filteredOptionsCount++;

            this.$on('queryChange', this.queryChange);
            this.$on('handleGroupDisabled', this.handleGroupDisabled);
        },

        beforeDestroy() {
            this.select.onOptionDestroy(this.select.options.indexOf(this));
        },

        methods: {
            hoverItem() {
                // 当前选项是非禁用的，则将当前选项的下标 赋值给 下拉列表的hoverIndex属性
                if (!this.disabled && !this.groupDisabled) {
                    this.select.hoverIndex = this.select.options.indexOf(this);
                }
            },

            selectOptionClick() {
                // 当前选项是非禁用的，则派发 ElSelect 组件的 handleOptionClick 事件
                if (this.disabled !== true && this.groupDisabled !== true) {
                    this.dispatch('ElSelect', 'handleOptionClick', [this, true]);
                }
            },

            /**
             *  判断两个变量的值是否相等
             */
            isEqual(a, b) {
                // 变量的类型只会是 string/number/object
                // 若不是对象类型，则直接比较两者的值
                if (!this.isObject) {
                    return a === b;
                }
                else {
                    // 若是对象类型，则会传入一个valueKey，作为取值的key
                    const valueKey = this.select.valueKey;

                    // 对象可能是深层次的，所以valueKey 可能是 a.b.c....的路径形式，不能取值
                    return getValueByPath(a, valueKey) === getValueByPath(b, valueKey);
                }
            },

            /**
             *  判断 arr 是否包含 target
             */
            contains(arr = [], target) {
                if (!this.isObject) {
                    return arr.indexOf(target) > -1;
                }
                else {
                    const valueKey = this.select.valueKey;

                    return arr.some(item => {
                        return getValueByPath(item, valueKey) === getValueByPath(target, valueKey);
                    });
                }
            },

            queryChange(query) {
                this.visible = new RegExp(escapeRegExp(query), 'i').test(this.currentLabel) || this.created;

                if (!this.visible) {
                    this.select.filteredOptionCount--;
                }
            },

            handleGroupDisabled(val) {
                this.groupDisabled = val;
            }
        },

        watch: {
            currentLabel() {
                if (!this.created && !this.select.remote) {
                    this.dispatch('ElSelect', 'setSelected');
                }
            },

            value(val, oldVal) {
                const { remote, valueKey } = this.select;

                // 这段没看懂
                if (!this.created && !remote) {
                    if (valueKey && typeof val === 'object' && typeof oldVal === 'object' && val[valueKey] === oldVal[valueKey]) {
                        return;
                    }

                    this.dispatch('ElSelect', 'setSelected');
                }
            }
        }
    }
</script>