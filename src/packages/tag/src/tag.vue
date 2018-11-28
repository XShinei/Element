

<script>
    export default {
        name: 'ElTag',

        render(h) {
            // 类名集合
            const classes = [
                'el-tag', this.type ? `el-tag--${this.type}` : '',
                this.tagSize ? `el-tag--${this.tagSize}`: '',
                {'is-hit': this.hit}
            ];

            // template
            const tagEl = (<span class={ classes } style={ {backgroundColor: this.color} }>
                { this.$slots.default }
                { this.closeable && <i class="el-tag__close el-icon-close" on-click={ this.handleClose }></i> }
            </span>);

            // 根据 disableTransitions，添加过渡组件 transition
            return this.disableTransitions ? tagEl : <transition name="el-zoom-in-center">{ tagEl }</transition>
        },

        props: {
            text: String,

            closeable: Boolean,     // 是否可关闭

            type: String,       // 主题     success/info/warning/danger

            hit: Boolean,       // 是否有边框描边

            disableTransitions: Boolean,        // 是否禁用渐变动画

            color: String,      // 背景色

            size: String
        },

        computed: {
            tagSize() {
                return this.size || (this.$ELEMENT || {}).size;
            }
        },

        methods: {
            handleClose(event) {
                event.stopPropagation();
                this.$emit('close', event);
            }
        }
    }
</script>