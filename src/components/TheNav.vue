<template>
    <div v-if="storeLibrary.userPrivilege === 'ADMIN'" class=" ml-5 w-full h-19">
        <a-menu v-model:selectedKeys="current" mode="horizontal">
            <a-menu-item key="books"  @click="goToViewBooks">
                <template #icon>
                    <RocketTwoTone rotate="50"/>
                </template>
                Books
            </a-menu-item>
            <a-menu-item key="requests" @click="goToViewRequests">
                <template #icon>
                    <RocketTwoTone rotate="50"/>
                </template>
                Requests
            </a-menu-item>
        </a-menu>
    </div>
    <div v-if="storeLibrary.userPrivilege === 'NORMAL'" class=" ml-5 w-full h-19">
        <a-menu v-model:selectedKeys="current" mode="horizontal">
            <a-menu-item key="books"  @click="goToViewNormalBooks">
                <template #icon>
                    <RocketTwoTone rotate="50"/>
                </template>
                Books
            </a-menu-item>
            <a-menu-item key="requests" @click="goToViewNormalRequests">
                <template #icon>
                    <RocketTwoTone rotate="50"/>
                </template>
                Requests
            </a-menu-item>
        </a-menu>
    </div>
</template>

<script>
    import { RocketTwoTone } from '@ant-design/icons-vue';
    import { ref } from 'vue';
    import { useStoreLibrary } from '@/stores/storeLibrary';
    export default {
        setup() {
            const current = ref(['books']);
            const storeLibrary = useStoreLibrary();

            return {
                current,
                storeLibrary,
            };
        },
        name: 'home',
        components: {
            RocketTwoTone,
        },
        data() {
            return {
            };
        },
        methods: {
            goToViewBooks(){
                this.$router.push('/admin-view-book');
            },

            goToViewRequests(){
                this.$router.push('/admin-view-requests');
            },
            goToViewNormalBooks(){
                this.$router.push('/normal-view-book');
            },

            goToViewNormalRequests(){
                this.$router.push('/normal-view-requests');
            },
        },
    };
</script>
