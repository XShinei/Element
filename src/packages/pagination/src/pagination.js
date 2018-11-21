import Pager from './pager.vue';

export default {
    name: 'ElPagination',

    props: {
        layout: String,

        pageSize: {
            type: Number,
            default: 10
        },

        total: Number,

        pageCount: Number,

        pagerCount: {
            type: Number,
            validator(value) {  // 1、整数  2、5 - 21 之间  3、奇数
                return (value | 0) === value && value > 4 && value < 22 && (value % 2) === 1;
            },
            default: 7
        },

        currentPage: {
            type: Number,
            default: 1
        },

        pageSizes: {
            type: Array,
            default() {
                return [10, 20, 30, 40, 50, 100];
            }
        },

        disabled: Boolean
    },

    data() {
        return {
            internalCurrentPage: 1,
            internalPageSize: 0,
            lastEmittedPage: -1,
            userChangePageSize: false
        };
    },

    computed: {
        internalPageCount() {
            if (typeof this.total === 'number') {
                return Math.ceil(this.total / this.internalPageSize);
            }
            else if (typeof this.pageCount === 'number') {
                return this.pageCount;
            }

            return null;
        }
    },

    methods: {
        handleCurrentChange(val) {
            // 保证 currentPage 是有效值 （ 基本只会在跳页的时候发生 ）
            this.internalCurrentPage = this.getValidCurrentPage(val);
            this.userChangePageSize = true;
            this.emitChange();
        },

        getValidCurrentPage(value) {
            value = parseInt(value, 10);

            const havePageCount = typeof this.internalPageCount === 'number';
            let resetValue;

            if (!havePageCount) {
                if (isNaN(value) || value < 1) {
                    resetValue = 1;
                } 
            }
            else {
                if (value < 1) {
                    resetValue = 1;
                }
                else if (value > this.internalPageCount) {
                    resetValue = this.internalPageCount;
                }
            }

            if (resetValue === undefined && isNaN(value)) {
                resetValue = 1;
            }
            else if (resetValue === 0) {
                resetValue = 1;
            }

            return resetValue === undefined ? value : resetValue;
        },

        emitChange() {
            this.$nextTick(() => {
                if (this.internalCurrentPage !== this.lastEmittedPage || this.userChangePageSize) {
                    this.$emit('current-change', this.internalCurrentPage);
                    this.lastEmittedPage = this.internalCurrentPage;
                    this.userChangePageSize = false;
                }
            });
        }
    },

    watch: {
        currentPage: {
            immediate: true,
            handler(val) {
                this.internalCurrentPage = val;
            }
        },

        pageSize: {
            immediate: true,
            handler(val) {
                this.internalPageSize = isNaN(val) ? 10 : val;
            }
        },

        internalCurrentPage: {
            immediate: true,
            handler(newVal, oldVal) {
                newVal = parseInt(newVal, 10);

                if (isNaN(newVal)) {
                    newVal = oldVal || 1;
                }
                else {
                    newVal = this.getValidCurrentPage(newVal);
                }

                if (newVal !== undefined) {
                    this.internalCurrentPage = newVal;

                    if (oldVal !== newVal) {
                        this.$emit('update:currentPage', newVal);
                    }
                }
                else {
                    this.$emit('update:currentPage', newVal);
                }

                this.lastEmittedPage = -1;
            }
        },

        internalPageCount(newVal) {
            const oldPage = this.internalCurrentPage;

            if (newVal > 0 && oldPage === 0) {
                this.internalCurrentPage = 1;
            }
            else if (oldPage > newVal) {
                this.internalCurrentPage = newVal === 0 ? 1 : newVal;
                this.userChangePageSize && this.emitChange();
            }

            this.userChangePageSize = false;
        }
    },

    render(h) {
        const layout = this.layout;

        if (!layout) {
            return;
        }

        const template = <div class={['el-pagination', {
            'is-background': this.background,
            'el-pagination--small': this.small
        }]}></div>;

        const TEMPLATE_MAP = {
            prev: <prev></prev>,
            jumper: <jumper></jumper>,
            pager: <pager currentPage={ this.internalCurrentPage } pageCount={ this.internalPageCount } pagerCount={ this.pagerCount } on-change={ this.handleCurrentChange } disabled={ this.disabled }></pager>,
            next: <next></next>,
            sizes: <sizes></sizes>,
            total: <total></total>
        };

        const components = layout.split(',').map(item => item.trim());
        const rightWrapper = <div class="el-pagination_rightwrapper"></div>;
        let haveRightWrapper = false;

        template.children = template.children || [];
        rightWrapper.children = rightWrapper.children || [];

        components.forEach(component => {
            if (component === '->') {
                haveRightWrapper = true;
                return;
            }

            if (!haveRightWrapper) {
                template.children.push(TEMPLATE_MAP[component]);
            }
            else {
                rightWrapper.children.push(TEMPLATE_MAP[component]);
            }
        });

        if (haveRightWrapper) {
            template.children.unshift(rightWrapper);
        }

        return template;
    },

    components: {
        Pager,

        Total: {
            render(h) {
                return (
                    typeof this.$parent.total === 'number'
                    ? <span class="el-pagination__total">共{ this.$parent.total }页</span>
                    : ''
                );
            }
        }
    }
};