<template>
    <div :class="[
            type === 'textarea' ? 'el-textarea' : 'el-input',
            inputSize ? 'el-input--' + inputSize : '',
            {
                'is-disabled': inputDisabled,
                'el-input-group': $slots.prepend || $slots.append,
                'el-input-group--append': $slots.append,
                'el-input-group--prepend': $slots.prepend,
                'el-input--prefix': $slots.prefix || prefixIcon,
                'el-input--suffix': $slots.suffix || suffixIcon || clearable
            }
        ]" 
        @mouseenter="hovering = true" 
        @mouseleave="hovering = false"
    >
        <template v-if="type !== 'textarea'">
            <!-- 前置元素 -->
            <div class="el-input-group__prepend" v-if="$slots.prepend">
                <slot name="prepend"></slot>
            </div>
            <input class="el-input__inner" 
                    v-if="type !== 'textarea'" 
                    :type="type"
                    :value="currentValue"
                    :disabled="inputDisabled"
                    :readonly="readonly"
                    :autocomplete="autocomplete" 
                    :aria-label="label"
                    v-bind="$attrs" 
                    @compositionstart="handleComposition"
                    @compositionupdate="handleComposition"
                    @compositionend="handleComposition"
                    @input="handleInput"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange"
                    ref="input"
            >

            <!-- 前置内容 -->
            <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
                <slot name="prefix"></slot>
                <i class="el-input__icon" :class="prefixIcon" v-if="prefixIcon"></i>
            </span>

            <!-- 后置内容 -->
            <span class="el-input__suffix" v-if="$slots.suffix || suffixIcon || showClear || validateState && needStatusIcon">
                <span class="el-input__suffix-inner">
                    <template v-if="!showClear">
                        <slot name="suffix"></slot>
                        <i class="el-input__icon" :class="suffixIcon" v-if="suffixIcon"></i>
                    </template>
                    <i v-else class="el-input__icon el-icon-circle-close el-input__clear"></i>
                </span>
                <i v-if="validateState" class="el-input__icon" :class="['el-input__validateIcon', validateState]"></i>
            </span>

            <!-- 后置元素 -->
            <div class="el-input-group__append" v-if="$slots.append">
                <slot name="append"></slot>
            </div>
        </template>
        <textarea v-else
                    class="el-textarea__inner"
                    :value="currentValue"
                    :style="textareaStyle"
                    :tabindex="tabindex"
                    :disabled="inputDisabled"
                    :readonly="readonly"
                    :aria-label="label"
                    v-bind="$attrs"
                    @input="handleInput"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange" 
                    @compostionstart="handleComposition" 
                    @compositionupdate="handleComposition" 
                    @compositionend="handleComposition" 
                    ref="textarea">
        </textarea>
    </div>
</template>

<script>
    export default {
        name: 'ElInput',

        componentName: 'ElInput',

        inject: {
            elForm: {
                default: ''
            },
            elFormItem: {
                default: ''
            }
        },

        props: {
            type: {
                type: String,
                default: 'text'
            },

            value: [String, Number],

            size: String,

            resize: String,     // 是否能被缩放

            form: String,       // 原生属性

            disabled: Boolean,

            readonly: Boolean,

            autosize: {         // 自适应内容高度，只对type="textarea"有效
                type: [Boolean, Object],
                default: false
            },

            autocomplete: {     // 原生属性，自动补全
                type: String,
                default: 'off'
            },

            validateEvent: {    // 输入时是否触发表单的验证
                type: Boolean,
            },

            suffixIcon: String, // 输入框头部图标

            prefixIcon: String, // 输入框尾部图标

            label: String,      // 输入框关联的label文字

            clearable: {
                type: Boolean,
                default: false
            },

            tabindex: String
        },

        data() {
            return {
                currentValue: this.value === undefined || this.value === null ? '' : this.value,
                isOnComposition: false,         // 是否开启输入法
                valueBeforeComposition: null,
                focused: false,
                hovering: false,
                textareaCalcStyle: {}
            };
        },

        computed: {
            inputDisabled() {
                // 组件自身的 disabled 属性优先，再是父组件form的 disabled 属性
                return this.disabled || (this.elForm || {}).disabled;
            },
            inputSize() {
                return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
            },
            validateState() {
                return this.elFormItem ? this.elFormItem.validateState : '';
            },
            needStatusIcon() {
                return this.elForm ? this.elForm.statusIcon : false;
            },
            validateIcon() {
                return {
                    validating: 'el-icon-loading',
                    success: 'el-icon-circle-check',
                    error: 'el-icon-circle-close'
                }[this.validateState];
            },
            showClear() {
                // 可清空、非禁用状态、非只读状态、绑定值不为空、获得焦点或鼠标移入状态
                // 同时满足以上所有情况，才显示 清空图标
                return this.clearable 
                    && !this.inputDisabled 
                    && !this.readonly 
                    && this.currentValue !== ''
                    && (this.focus || this.hovering);
            },
            textareaStyle() {
                return merge({}, this.textareaCalcStyle, {resize: this.resize});
            }
        },

        methods: {
            handleComposition() {
                if (event.type === 'compositionend') {
                    this.isOnComposition = false;
                    this.currentValue = this.valueBeforeComposition;
                    this.valueBeforeComposition = null;
                    this.handleInput(event);
                }
                else {  // compositionstart or compositionupdate
                    const text = event.target.value;
                    const lastCharacter = text[text.length - 1] || '';

                    this.isOnComposition = !isKorean(lastCharacter);

                    if (this.isOnComposition && event.type === 'compositionstart') {
                        this.valueBeforeComposition = text;
                    }
                }
            },
            handleInput(event) {
                const value = event.target.value;
                this.setCurrentValue(value);

                if (this.isOnComposition) {
                    return;
                }

                this.$emit('input', value);
            },
            handleFocus(event) {
                this.focused = true;
                this.$emit('focus', event);
            },
            handleBlur(event) {
                this.focused = false;
                this.$emit('blur', event);

                if (this.validateEvent) {

                }
            },
            handleChange(event) {
                this.$emit('change', event.target.value);
            },
            setCurrentValue(value) {
                if (this.isOnComposition && value === this.valueBeforeComposition) {
                    return;
                }
            },
            /**
             *  根据 prepend/append offsetWidth 偏移 prefix/suffix icon
             */
            calcIconOffset(place) {
                let elList = [].slice.call(this.$el.querySelectorAll(`.el-input__${place}`) || []);
                
                if (!elList.length) {
                    return;
                }

                let el = null;

                for (let i = 0; i < elList.length; i++) {
                    if (elList[i].parentNode === this.$el) {
                        el = elList[i];
                        break;
                    }
                }
                
                if (!el) {
                    return;
                }

                const pendantMap = {
                    suffix: 'append',
                    prefix: 'prepend'
                };
                const pendant = pendantMap[place];
                
                if (this.$slots[pendant]) {
                    el.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${this.$el.querySelector(`.el-input-group__${pendant}`).offsetWidth}px)`;
                }
                else {
                    el.removeAttribute('style');
                }
            },
            updateIconOffset() {
                this.calcIconOffset('prefix');
                this.calcIconOffset('suffix');
            },
            resizeTextarea() {
                if (this.$isServer) {
                    return;
                }

                const { autosize, type } = this;

                if (type !== 'textarea') {
                    return;
                }

                if (!autosize) {

                }
            }
        },

        mounted() {
            this.updateIconOffset();
        },

        watch: {
            value(val) {
                this.setCurrentValue(val);
            }
        }
    }
</script>