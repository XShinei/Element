import Pager from './pager.vue';

export default {
    name: 'ElPagination',

    props: {
        layout: String
    },

    data() {
        return {};
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
            pager: <pager currentPage={ 1 } pageCount={ 10 } pagerCount={ 7 } on-change={ () => {} } disabled={ false }></pager>,
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
        Pager
    }
};