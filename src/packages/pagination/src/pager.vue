<template>
    <ul class="el-pager" @click="onPagerClick">
        <li class="number" :class="{ active: currentPage === 1, disabled }" v-if="pageCount > 0">1</li>
        <li class="el-icon more btn-quickprev"
            :class="[quickprevIconClass, {disabled} ]" 
            v-if="showPrevMore"  
            @mouseenter="onMouseenter('left')" 
            @mouseleave="quickprevIconClass = 'el-icon-more'">
        </li>
        <li class="number"
            :class="{ active: item === currentPage, disabled }"
            v-for="item in pagers" 
            :key="item">
            {{ item }}
        </li>
        <li class="el-icon more btn-quicknext"
            :class="[quicknextIconClass, { disabled }]" 
            v-if="showNextMore"  
            @mouseenter="onMouseenter('right')" 
            @mouseleave="quicknextIconClass = 'el-icon-more'">
        </li>
        <li class="number" :class="{ active: currentPage === pageCount, disabled }" v-if="pageCount > 1">{{ pageCount }}</li>
    </ul>
</template>

<script>
    export default {
        name: 'ElPager',

        props: {
            currentPage: Number,
            pageCount: Number,
            pagerCount: Number,
            disabled: Boolean
        },

        data() {
            return {
                current: null,
                showPrevMore: false,
                showNextMore: false,
                quicknextIconClass: 'el-icon-more',
                quickprevIconClass: 'el-icon-more'
            };
        },

        computed: {
            pagers() {
                const currentPage = this.currentPage;
                const pageCount = this.pageCount;
                const pagerCount = this.pagerCount;
                const halfPagerCount = (this.pagerCount - 1) / 2;

                let showPrevMore = false;
                let showNextMore = false;

                if (pageCount > pagerCount) {
                    if (currentPage > pagerCount - halfPagerCount) {
                        showPrevMore = true;
                    }

                    if (currentPage < pageCount - halfPagerCount) {
                        showNextMore = true;
                    }
                }

                const list = [];

                if (!showPrevMore && showNextMore) {
                    for (let i = 2; i < pagerCount; i++) {
                        list.push(i);
                    }
                }
                else if (showPrevMore && !showNextMore) {
                    const startPage = pageCount - (pagerCount - 2);
                    for (let i = startPage; i < pageCount; i++) {
                        list.push(i);
                    }
                }
                else if (showPrevMore && showNextMore) {
                    const offset = Math.floor(pagerCount / 2) - 1;
                    for (let i = currentPage - offset ; i <= currentPage + offset; i++) {
                        list.push(i);
                    }
                }
                else {
                    for (let i = 2; i < pageCount; i++) {
                        list.push(i);
                    }
                }

                this.showPrevMore = showPrevMore;
                this.showNextMore = showNextMore;

                return list;
            }
        },

        methods: {
            /**
             *  事件代理
             *  通过event.target判断要执行的动作
             */
            onPagerClick(event) {
                const target = event.target;
                
                // target为ul 或 组件状态为disabled 不执行任何动作
                if (target.tagName === 'UL' || this.disabled) {
                    return;
                }

                let newPage = Number(event.target.textContent);
                const pageCount = this.pageCount;
                const currentPage = this.currentPage;
                // 快速翻页的距离
                const pagerCountOffset = this.pagerCount - 2;

                // target为 快速翻页按钮
                if (target.className.indexOf('more') !== -1) {
                    // 向前
                    if (target.className.indexOf('quickprev') !== -1) {
                        newPage = currentPage - pagerCountOffset;
                    }
                    // 向后
                    else if (target.className.indexOf('quicknext') !== -1) {
                        newPage = currentPage + pagerCountOffset;
                    }
                }

                if (!isNaN(newPage)) {
                    if (newPage < 1) {
                        newPage = 1;
                    }

                    if (newPage > pageCount) {
                        newPage = pageCount;
                    }

                    // 最后若 currentPage 变化，则向上派发change事件
                    if (newPage !== currentPage) {
                        this.$emit('change', newPage);
                    }
                }
            },
            onMouseenter(direction) {
                if (this.disabled) {
                    return;
                }

                if (direction === 'left') {
                    this.quickprevIconClass = 'el-icon-d-arrow-left';
                }
                else if (direction === 'right') {
                    this.quicknextIconClass = 'el-icon-d-arrow-right';
                }
            }
        }
    }
</script>