<template>
    <div class="flex flex-wrap">
        <!--        Spinner for initial table load       -->
        <div v-if="!storeLibrary.booksLoaded" class="w-full">
            <a-spin tip="Loading...">
                <a-alert
                    message="Retrieving Data"
                    description="Please Hold"
                ></a-alert>
            </a-spin>
        </div>
        <!--        MODAL FOR IMAGES       -->
        <a-modal v-model:visible="modalVisible" footer='' @ok="handleOk">
            <a-image
                class = "ml-[135px] mt-10"
                :width="200"
                :height="400"
                :preview="false"
                v-bind:src="modalImage"
            />
        </a-modal>
        <!--        HEADER AND ADD BUTTON       -->
        <div v-if="storeLibrary.booksLoaded" class="mt-5 w-full">
            <span class=" font-medium text-3xl ml-12">Books</span>
        </div>
        <!--        ADD BUTTON       -->
        <div class = "w-full">
            <div class = "ml-12 mt-28 w-full">
                <a-typography-text class="font-medium">Filter (By User):</a-typography-text>
                <a-input v-model:value="filteredUser" class = "ml-5 w-2/12"
                         placeholder="Enter User Email"
                         @keyup.enter="filterUserBooks"
                         @change="resetFilterUserBooks"
                />
            </div>
            <div v-if="storeLibrary.booksLoaded" class="flex justify-between w-10/12 ml-12 mt-5">
                <div>
                    <a-typography-text class="font-medium">Filter (Status):</a-typography-text>
                    <a-checkbox v-model:checked="storeLibrary.checkedAvailable" class="ml-9" @change="availableToggled">Reserved</a-checkbox>
                    <a-checkbox v-model:checked="storeLibrary.checkedReserved" class="ml-9" @change="reservedToggled">Available</a-checkbox>
                </div>
            </div>
        </div>

        <a-table
            v-if="storeLibrary.booksLoaded"
            class="ma-keyword-table w-10/12 ml-12 mt-7 " size="middle"
            :data-source="storeLibrary.books"
        >
            <!--        TABLE COMPONENT         -->
            <a-table-column key="image_url" class='w-20' title="">
                <template #default="{ record }">
                    <a-image
                        :width="50"
                        :preview="false"
                        v-bind:src="record.image_url"
                        @click="showImageModal(record)"
                    />
                </template>
            </a-table-column>
            <a-table-column key="title" title="Title" data-index="title"/>
            <a-table-column key="isbn" title="Isbn" data-index="isbn"/>
            <a-table-column key="author" title="Author" data-index="author"/>
            <a-table-column key="loaned_by" title="Loaned By" data-index="loaned_by">
                <template #default="{ record }">
                    <span v-if="record.status === 'RESERVED'">
                        {{record.loaned_by}}
                    </span>
                </template>
            </a-table-column>
            <a-table-column key="status" title="Status" data-index="status">
                <template #default="{ record }">
                    <span v-if="record.status === 'AVAILABLE'" class ="text-green-500">
                        {{record.status}}
                    </span>
                    <span v-if="record.status === 'RESERVED'" class= "text-rose-700">
                        {{record.status}}
                    </span>
                </template>
            </a-table-column>
            <a-table-column key="action" title="Action">
                <template #default="{ record }">
                    <span>
                        <a-divider type="vertical"/>
                        <template v-if= "record.status === 'AVAILABLE'">
                            <a-divider type="vertical"/>
                            <a-button type = "primary"  @click="checkoutBook(record)">Checkout</a-button>
                        </template>
                        <template  v-if= "(record.loaned_by === currentUser) && (record.status === 'RESERVED')">
                            <a-divider type="vertical"/>
                            <a-button type = "primary"   @click="returnBook(record)">Return</a-button>
                        </template>
                    </span>
                </template>
            </a-table-column>
        </a-table>
    </div>
</template>

<script setup>
    import { useStoreLibrary } from '@/stores/storeLibrary.js';
    import { onMounted, reactive, ref } from 'vue';
    import { message } from 'ant-design-vue';

    //initialize store library
    const storeLibrary = useStoreLibrary();


    //ref for the filtered user input box
    const filteredUser = ref('');

    //retrieves current user from store
    const currentUser = storeLibrary.userLogged;


    ////MODAL LOGIC
    //image store for the modal image
    const modalImage = ref('');
    const modalVisible = ref(false);
    const showModal = () => {
        modalVisible.value = true;
    };

    function showImageModal(record){
        modalImage.value = record.image_url;
        showModal();
    }

    //BUTTON LOGIC

    //Function to checkout the book
    function checkoutBook(record){
        storeLibrary.checkoutBooks(record.id);
    }
    //Function to return the book
    function returnBook(record){
        storeLibrary.returnBooks(record.id);
        filteredUser.value = '';
        storeLibrary.getBooks();
    }
    //toggle logic
    function availableToggled(){
        console.log(storeLibrary.checkedAvailable);
        storeLibrary.getToggledBooks();
    }
    function reservedToggled(){
        storeLibrary.getToggledBooks();
    }

    //filterUser Logic
    function filterUserBooks(){
        storeLibrary.getFilteredUserBooks(filteredUser.value);
    }
    function resetFilterUserBooks(){
        if (filteredUser.value === ''){
            storeLibrary.getBooks();
        }
    }
    /*
mounted
*/
    onMounted(()=> {
        storeLibrary.getBooks();
    });
</script>

<style scoped>

</style>
