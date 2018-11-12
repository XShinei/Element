<template>
    <ul class="el-pager">
        <li class="number" v-if="pageCount > 0">1</li>
        <li class="el-icon more btn-quickprev el-icon-more" 
            v-if="showPrevMore">
        </li>
        <li class="number"
            :class="{ active: item === currentPage, disabled }"
            v-for="item in pagers" 
            :key="item">
            {{ item }}
        </li>
        <li class="el-icon more btn-quicknext el-icon-more" 
            v-if="showNextMore">
        </li>
        <li class="number" v-if="pageCount > 1">{{ pageCount }}</li>
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
                        array.push(i);
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

        }
    }
</script>