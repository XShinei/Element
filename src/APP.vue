<template>
    <div>
        <pagination 
            layout="pager" :total="107" :current-page="1">
        </pagination>
    </div>
</template>

<script>
    import Pagination from './packages/pagination/index.js';

    export default {
        components: {
            Pagination
        }
    }
</script>