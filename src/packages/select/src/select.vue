<template>
    <div class="el-select" 
        :class="[selectSize ? 'el-select--' + selectSize : '']">
        <div >

        </div>
        <el-input type="text" 
                    v-model="selectedLabel"
                    :placeholder="currentPlaceholder"
                    :name="name"
                    :id="id"
                    :autocomplete="autocomplete"
                    :size="selectSize"
                    :disabled="selectDisabled"
                    :readonly="readonly"
                    :validate-event="false"
                    :class="{'is-icon': visible}"
                    @focus="handleFocus" 
                    @blur="handleBlur"
                    @keyup.native="debouncedOnInputChange"
                    @keydown.native.down.stop.prevent="navigateOptions('next')"
                    @keydown.native.up.stop.prevent="navigateOptions('prev')"
                    @keydown.native.enter.prevent="selectOption"
                    ref="reference">

        </el-input>
    </div>
</template>

<script>
    import ElInput from '../../../packages/input/index';
    import Emitter from '../../../mixins/emitter';
    import NavigationMixin from './navigation-mixin';
    import debounce from 'throttle-debounce';

    export default {
        name: 'ElSelect',

        componentName: 'ElSelect',

        mixins: [Emitter, NavigationMixin],

        props: {
            name: String,       // select input 的 name 属性

            id: String,

            value: {
                required: true
            },

            autocomplete: {     // select input 的 autocomplete 属性
                type: String,
                default: 'off'
            },

            automaticDropdown: Boolean,     // 对于不可搜索的Select，是否在输入框获得焦点后自动弹出选项菜单

            size: String,

            disabled: Boolean,

            clearable: Boolean,

            filterable: Boolean,

            allowCreate: Boolean,   // 是否允许用户创建新条目，需配合 filterable

            loading: Boolean,       // 是否正在从远程获取数据

            popperClass: String,    // Select 下拉框的类型

            remote: Boolean,        // 是否为远程搜索

            loadingText: String,

            noMatchText: String,

            remoteMethod: Function,

            filterMethod: Function,

            multiple: Boolean,      // 是否多选

            mutipleLimit: {         // 多选时用户最多可选择的项目数，为0时则不限制
                type: Number,
                default: 0
            },

            placeholder: {
                type: String,
                default() {
                    return '';
                }
            },

            defaultFirstOption: Boolean,    // 在输入框按下回车，选择第一个匹配项，需配合 filterable 或 remote 使用

            reserveKeyword: Boolean,        // 多选且可搜索时，是否在选中一个选项后保留当前的搜索关键字

            valueKey: {                     // 作为value唯一标识的键名，绑定值为对象类型时必填
                type: String,
                default: 'value'
            },

            collapseTags: Boolean,          // 多选时，是否将选中值按文字形式展示

            popperAppendToBody: {           // 是否将弹出框插入至body元素。在弹出框的定位出现问题时，可将该属性设置为true
                type: Boolean,
                default: true
            }
        },

        data() {
            return {
                selectedLabel: '',      // 已选中 的 label
                visible: false,         // 下拉框出现/隐藏
                hoverIndex: -1,         // 选中 的 下拉选项 的 索引
                selected: this.multiple ? [] : {},      // 已选中的拉下选项
                currentPlaceholder: '',
                cachedPlaceholder: '',
                previousQuery: null,      // 先前的查询参数 
                isOnComposition: false,     // 输入法是否开启
                filteredOptionsCount: 0,
                optionsCount: 0,
                inputLength: 20,        // 输入框的初始宽度
                softFocus: false,       // 
                isSilentBlur: false,    //
                menuVisibleOnFocus: false,       // ???
                options: [],        // 下拉选项集合
            };
        },

        computed: {
            selectSize() {
                return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
            },

            selectDisabled() {
                return this.disabled || (this.elForm || {}).disabled;
            },

            // 防抖时间间隔
            debounce() {
                return this.remote ? 300 : 0;
            }
        },

        created() {
            this.debounceOnInputChange = debounce(this.debounce, () => {
                this.onInputChange();
            });
        },

        methods: {
            resetHoverIndex() {
                setTimeout(() => {
                    // 单选
                    if (!this.multiple) {
                        this.hoverIndex = this.options.indexOf(this.selected);
                    }
                    else {
                        // 多选

                        // 选中的数目大于0
                        if (this.selected.length > 0) {
                            // 取选中的选项 中 最小的索引
                            this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)));
                        }
                        else {
                            this.hoverIndex = -1;
                        }
                    }
                });
            },
            handleQueryChange(val) {
                //查询参数与之前的相同，即未发生改变    或  开启输入法输入中
                if (this.previousQuery === val || this.isOnComposition) {
                    return;
                }

                if (this.previousQuery === null 
                    && (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')) {
                    this.previousQuery = val;

                    return;
                }

                this.previousQuery = val;

                this.$nextTick(() => {
                    // 下拉框显示，更新下拉框
                    if (this.visible) {
                        this.broadcast('ElSelectDropdown', 'updatePopper');
                    }
                });

                this.hoverIndex = -1;

                // 多选 且 可搜索
                if (this.multiple && this.filterable) {
                    const length = this.$refs.input.value.length * 15 + 20;
                    this.inputLength = this.collapseTags ? Math.min(50, length) : length;

                }

                if (this.remote && typeof this.remoteMethod === 'function') {
                    this.hoverIndex = -1;
                    this.remoteMethod(val);
                }
                else if (typeof this.filterMethod === 'function') {
                    this.filterMethod(val);
                    this.broadcast('ElOptionGroup', 'queryChange');
                }
                else {
                    this.filteredOptionsCount = this.optionsCount;
                    this.broadcast('ElOption', 'queryChange', val);
                    this.broadcast('ElOptionGroup', 'queryChange');
                }

                if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
                    this.checkDefaultFirstOption();
                }
            },

            managePlaceholder() {
                if (this.currentPlaceholder !== '') {

                }
            },

            handleFocus(event) {
                if (!this.softFocus) {
                    // 自动弹出下拉框 或  可搜索
                    if (this.automaticDropdown || this.filterable) {
                        // 显示下拉框
                        this.visible = true;
                        this.menuVisibleOnFocus = true;
                    }

                    this.$emit('focus', event);
                }
                else {
                    this.softFocus = false;
                }
            },

            handleBlur() {
                setTimeout(() => {
                    if (this.isSilentBlur) {
                        this.isSilentBlur = false;
                    }
                    else {
                        this.$emit('blur', event);
                    }
                }, 50);

                this.softFocus = false;
            },

            onInputChange() {
                if (this.filterable && this.query !== this.selectedLabel) {

                }
            },

            selectOption() {
                if (!this.visible) {

                }
                else {
                    if (this.options[this.hoverIndex]) {
                        this.handleOptionSelect(this.options[this.hoverIndex]);
                    }
                }
            }
        },

        watch: {
            visible(val) {
                if (!val) {
                    // 触发该组件下 所有后代组件名为 ElSelectDropdown 的组件 的  destoryPopper 事件
                    this.broadcast('ElSelectDropdown', 'destoryPopper');

                    // 输入框失去焦点
                    if (this.$refs.input) {
                        this.$refs.input.blur();
                    }

                    this.query = '';
                    this.previousQuery = null;
                    this.selectedLabel = '';
                    this.inputLength = 20;

                    // 重置 选中的下拉选项索引
                    this.resetHoverIndex();

                    this.$nextTick(() => {
                        if (this.$refs.input && this.$refs.input.value === '' && this.selected.length === 0) {
                            this.currentPlaceholder = this.cachedPlaceholder;
                        }
                    });

                    if (!this.multiple) {
                        if (this.selected) {

                        }
                    }
                }
                else {
                    // 下拉框显现
                    // 派发 所有名为 ElSelectDropdown 的后代组件 updatePopper 事件，即更新下拉框
                    this.broadcast('ElSelectDropdown', 'updatePopper');

                    // 可搜索
                    if (this.filterable) {
                        // 远程搜索，则查询参数为空？
                        this.query = this.remote ? '' : this.selectedLabel;
                        this.handleQueryChange(this.query);

                        if (this.multiple) {
                            this.$refs.input.focus();
                        }
                        else {
                            if (!this.remote) {
                                this.broadcast('ElOption', 'queryChange', '');
                                this.broadcast('ElOptionGroup', 'queryChange')
                            }

                            this.broadcast('ElInput', 'inputSelect')
                        }
                    }
                }

                this.$emit('visible-change', val);
            },

            placeholder(val) {
                this.cachedPlaceholder = this.currentPlaceholder = val;
            }
        }
    }
</script>