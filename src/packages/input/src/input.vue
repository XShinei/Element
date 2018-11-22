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
    @mouseleave="hovering = false">
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
            <span class="el-input__prefix">
                <i class="el-input__icon" :class="prefixIcon" v-if="prefixIcon"></i>
            </span>
        </template>
    </div>
</template>

<script>
    export default {
        name: 'ElInput',

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

            resize: String,

            form: String,

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
                isOnComposition: false,
                valueBeforeComposition: null,
                focused: false,
                hovering: false
            };
        },

        computed: {
            inputDisabled(event) {

            },
            inputSize() {
                return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
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
                else {  // compositionstart  or compositionupdate
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
            }
        },

        mounted() {
            this.updateIconOffset();
        }
    }
</script>