<template>
    <div class="flex flex-wrap">
        <!--        Spinner for initial table load       -->
        <div v-if="!storeLibrary.requestsLoaded" class="w-full">
            <a-spin tip="Loading...">
                <a-alert
                    message="Retrieving Data"
                    description="Please Hold"
                ></a-alert>
            </a-spin>
        </div>

        <!--       MODAL TO VIEW REQUEST REASON    -->
        <a-modal v-model:visible="modalReasonVisible" title="Reason"
                 footer=''
                 @ok="reasonHandleOk"
                 @cancel="reasonHandleCancel"
        >
            <p>{{storeReason}}</p>
        </a-modal>
        <!--       MODAL TO GIVE USER REJECTION REASON    -->
        <a-modal v-model:visible="modalRejectionReasonVisible" title="Rejection Reason"
                 footer=''
                 @cancel="reasonRejectionHandleCancel"
        >
            <p>{{rejectionReason}}</p>
        </a-modal>
        <!--        HEADER      -->
        <div v-if="storeLibrary.requestsLoaded" class="mt-5 w-full">
            <span class=" font-medium text-3xl ml-12">Requests</span>
        </div>
        <!--        CHECKBOXES AND ADD BUTTON       -->
        <div class="w-full">
            <div v-if="storeLibrary.requestsLoaded" class="flex justify-between w-10/12 ml-12 mt-28">
                <div>
                    <a-typography-text class="font-medium">Filter (Status):</a-typography-text>
                    <a-checkbox v-model:checked="storeLibrary.checkedRejected" class="ml-9" @change="rejectToggled">Rejected</a-checkbox>
                    <a-checkbox v-model:checked="storeLibrary.checkedAccepted" class="ml-9" @change="acceptToggled">Accepted</a-checkbox>
                </div>

                <a-button class = "" title="New Request"
                          type="primary"
                          @click="showAddDrawer"
                >
                    <template #icon>
                        <plus-outlined class = "text-lg"/>
                    </template>
                </a-button>
            </div>
        </div>

        <a-table
            v-if="storeLibrary.requestsLoaded"
            class="ma-keyword-table w-10/12 ml-12 mt-5" size="middle"
            :data-source="storeLibrary.requests"
        >
            <!--        TABLE COMPONENT         -->
            <a-table-column key="title" title="Title" data-index="title"/>
            <a-table-column key="isbn" title="Isbn" data-index="isbn"/>
            <a-table-column key="amazon_link" title="Amazon Link" data-index="amazon_link"/>
            <a-table-column key="reason" title="Reason" data-index="reason">
                <template #default="{ record }">
                    <span class="text-sky-500" @click="showReason(record)">Click To View</span>
                </template>
            </a-table-column>
            <a-table-column key="status" title="Status" data-index="status">
                <template #default="{ record }">
                    <span v-if="record.status === 'PENDING'" class ="text-blue-600">
                        {{record.status}}
                    </span>
                    <span v-if="record.status === 'ACCEPTED'" class= "text-green-500">
                        {{record.status}}
                    </span>
                    <span v-if="record.status === 'REJECTED'" class= "text-rose-700" @click="giveUserReason(record)">
                        {{record.status}}[Click to View]
                    </span>
                </template>
            </a-table-column>

        </a-table>
        <!--        DRAWER FOR ADD BUTTON        -->
        <a-drawer
            v-model:visible="addVisible"
            class="custom-class"
            title="New Request"
            placement="right"
            width = 800
            @after-visible-change="afterVisibleChange"
        >
            <div class="">
                <!--        FORM FOR ADD BOOKS     -->
                <a-form
                    class=" w-6/12 mt-12"
                    :model="formState"
                    name="basic"
                    :label-col="{ span: 8}"
                    :wrapper-col="{ span: 19}"
                    autocomplete="off"
                    @finish="onFinish"
                    @finishFailed="onFinishFailed"
                >
                    <a-form-item
                        class="mb-10"
                        label="Title"
                        name="requestBookTitle"
                        :rules="[{ required: true, message: 'Please input the Book Title!' }]"
                    >
                        <a-auto-complete
                            v-model:value="formState.requestBookTitle"
                            :options="options"
                            style="width: 200px"
                            @select="onSelect"
                            @search="onSearch"
                        />
                        <a-spin v-if="apiFetching" class="ml-2"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="ISBN"
                        name="requestBookIsbn"
                        :rules="[{ required: true, message: 'Please input the Isbn of the book!' }]"
                    >
                        <a-input v-model:value="formState.requestBookIsbn"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="Amazon Link"
                        name="requestAmazonLink"
                        :rules="[{ required: true, message: 'Please input the name of the author!' }]"
                    >
                        <a-input v-model:value="formState.requestAmazonLink"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="Request Reason"
                        name="requestReason"
                        :rules="[{ required: true, message: 'Please input the url for the book image' }]"
                    >
                        <a-input v-model:value="formState.requestReason"/>
                    </a-form-item>
                    <a-button class = "ml-[120px] mt-10 mb-10" type="primary"
                              size="large"
                              html-type="submit"
                    >Add</a-button>
                </a-form>
            </div>
        </a-drawer>
    </div>
</template>

<script setup>
    import { useStoreLibrary } from '@/stores/storeLibrary.js';
    import { onMounted, reactive, ref } from 'vue';
    import { PlusOutlined } from '@ant-design/icons-vue';

    //initialize store library
    const storeLibrary = useStoreLibrary();

    //store reason for modal to show
    const storeReason = ref('');

    //used to get info from add form
    const formState = reactive({
        requestBookIsbn: '',
        requestBookTitle: '',
        requestAmazonLink: '',
        requestReason: '',
    });

    //for viewing reason
    const modalReasonVisible = ref(false);
    function showReason(request){
        modalReasonVisible.value=true;
        storeReason.value = request.reason;
    }
    function reasonHandleCancel(){
        modalReasonVisible.value=false;
    }

    // for viewing reason the request got rejected
    const modalRejectionReasonVisible = ref(false);
    const rejectionReason=ref('');
    function giveUserReason(reason){
        modalRejectionReasonVisible.value=true;
        console.log(reason.reject_reason);
        rejectionReason.value  = reason.reject_reason;
    }
    function reasonRejectionHandleCancel(){
      modalRejectionReasonVisible.value=false;
    }

    //drawer logic
    //Add drawer
    const addVisible = ref(false);
    const showAddDrawer = () => {
        addVisible.value = true;
    };


    //onFinish add books form method
    const onFinish = () => {
        storeLibrary.addRequests(formState.requestBookTitle,formState.requestBookIsbn,formState.requestAmazonLink, formState.requestReason);
        addVisible.value=false;
        formState.requestBookTitle = '';
        formState.requestBookIsbn = '';
        formState.requestAmazonLink = '';
        formState.requestReason = '';
    };


    //toggle logic
    function rejectToggled(){
        storeLibrary.getToggledNormalRequests();
    }
    function acceptToggled(){
        storeLibrary.getToggledNormalRequests();
    }

    /*
mounted
*/
    onMounted(()=> {
        storeLibrary.getRequests();
    });
</script>

<style scoped>

</style>
