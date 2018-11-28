<template>
    <div>select</div>
</template>

<script>
    export default {
        name: 'ElSelect',

        componentName: 'ElSelect',

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
        }
    }
</script>