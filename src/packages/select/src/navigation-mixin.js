export default {
    data() {
        return {
            hoverOption: -1
        };
    },

    computed: {
        optionsAllDisabled() {
            // 先筛选出 options 中可见得部分，再对这部分 options 判断是否所有都是 disabled
            return this.options.filter(option => option.visible).every(option => option.disabled);
        }
    },

    watch: {
        hoverIndex(val) {
            if (typeof val === 'number' && val > -1) {
                // hoverOption 保存当前鼠标悬停的 下拉选项
                this.hoverOption = this.options[val] || {};
            }

            // 每个下拉选项的 hover 属性，记录自身是否是当前鼠标悬停
            this.options.forEach(option => {
                option.hover = this.hoverOption === option;
            });
        }
    },

    methods: {
        navigateOptions(direction) {
            // 保证下拉框是可见的
            if (!this.visible) {
                this.visible = true;

                return;
            }

            // 保证下拉选项的个数大于0
            if (this.options.length || this.filteredOptionsCount === 0) {
                return;
            }

            // 保证下拉选项至少有一个是 可选的
            if (!this.optionsAllDisabled) {
                if (direction === 'next') {
                    this.hoverIndex++;

                    if (this.hoverIndex === this.options.length) {
                        this.hoverIndex = 0;
                    }
                }

                if (direction === 'prev') {
                    this.hoverIndex--;

                    if (this.hoverIndex === -1) {
                        this.hoverIndex = this.options.length - 1;
                    }
                }

                // 获取hoverIndex指向的下拉选项对象
                const option = this.options[hoverIndex];

                // 若当前下拉选项是 禁用的 或 不可见的
                // 则继续向前 或 向后 寻找下一个 下拉选项
                if (option.disabled || option.groupDisabled || !option.visible) {
                    this.navigateOptions(direction);
                }

                // 滚动到 hoverOption 的位置
                this.$next(() => {
                    this.scrollToOption(this.hoverOption);
                });
            }
        }
    }
};