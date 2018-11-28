<template>
    <div>tag</div>
</template>

<script>
    export default {
        name: 'ElTag',

        props: {
            text: String,

            closeable: Boolean,     // 是否可关闭

            type: String,       // 主题     success/info/warning/danger

            hit: Boolean,       // 是否有边框描边

            disableTransitions: Boolean,        // 是否禁用渐变动画

            color: String,      // 背景色

            size: String
        }
    }
</script>