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
        <!--       MODAL FOR ACCEPT BUTTON     -->
        <a-modal v-model:visible="modalAcceptVisible" title="Accept Request"
                 @ok="acceptHandleOk"
                 @cancel="acceptHandleCancel"
        >
            <p>Are you sure you want to accept the selected request?</p>
        </a-modal>
        <!--       MODAL TO VIEW REQUEST REASON    -->
        <a-modal v-model:visible="modalReasonVisible" title="Reason"
                 footer=''
                 @ok="reasonHandleOk"
                 @cancel="reasonHandleCancel"
        >
            <p>{{storeReason}}</p>
        </a-modal>
        <!--        HEADER      -->
        <div v-if="storeLibrary.requestsLoaded" class="mt-5 w-full">
            <span class=" font-medium text-3xl ml-12">Requests</span>
        </div>
        <!--        CHECKBOXES AND ADD BUTTON       -->
        <div class="w-full">
            <div class = "ml-12 mt-28 w-full">
                <a-typography-text class="font-medium">Filter (By User):</a-typography-text>
                <a-input v-model:value="filteredUser" class = "ml-5 w-2/12"
                         placeholder="Enter User Email"
                         @keyup.enter="filterUserRequests"
                         @change="resetFilterUserRequests"
                />
            </div>
            <div v-if="storeLibrary.requestsLoaded" class="flex justify-between w-10/12 ml-12 mt-5">
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
            <a-table-column key="requested_by" title="Requested By" data-index="requested_by"/>
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
                    <span v-if="record.status === 'REJECTED'" class= "text-rose-700">
                        {{record.status}}
                    </span>
                </template>
            </a-table-column>
            <a-table-column v-if="(!storeLibrary.checkedAccepted && !storeLibrary.checkedRejected) " key="action" title="Action">
                <template #default="{ record }">
                    <span v-if="(record.status === 'PENDING')">
                        <a-button type="primary" @click="acceptRequest(record)">Accept</a-button>
                        <a-divider type="vertical"/>
                        <a-button type="primary" danger @click="showRejectDrawer(record)">Reject</a-button>
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
        <!--        DRAWER FOR REJECT BUTTON        -->
        <a-drawer
            v-model:visible="rejectVisible"
            class="custom-class"
            title="Rejection Form"
            placement="right"
            width = 800
            @after-visible-change="afterVisibleChange"
        >
            <div class="">
                <!--        FORM FOR REJECT REQUESTS       -->
                <a-form
                    class=" w-8/12 mt-12"
                    :model="formStateReject"
                    name="basic"
                    :label-col="{ span: 8}"
                    :wrapper-col="{ span: 19}"
                    autocomplete="off"
                    @finish="onFinishReject"
                    @finishFailed="onFinishFailedReject"
                >
                    <a-form-item
                        class="mb-10 -ml-4"
                        label="Rejection Reason"
                        name="rejectionReason"
                        :rules="[{ required: true, message: 'Please input the reason for the rejection!' }]"
                    >
                        <a-textarea
                            v-model:value="formStateReject.rejectionReason"
                            class="ml-3 w-full"
                            placeholder="Enter the rejection reason"
                            rows="5"
                        />
                    </a-form-item>
                    <a-button class = "ml-44 mb-10" type="primary"
                              size="large"
                              html-type="submit"
                    >Reject Request</a-button>
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

    //storing reference to record when user clicks specific table fields
    const userSelectionRef = ref({});

    //store reason for modal to show
    const storeReason = ref('');

    //add book options autocomplete
    const options = ref([]);
    const booksJsonArr = ref([]);
    const refRequestSelected = reactive({});
    //used to get info from add form
    const formState = reactive({
        requestBookIsbn: '',
        requestBookTitle: '',
        requestAmazonLink: '',
        requestReason: '',
    });
    //used to get info from reject form
    const formStateReject = reactive({
        rejectionReason: '',
    });


    //ref for the filtered user input box
    const filteredUser = ref('');
    ////MODAL LOGIC
    //modal code for the accept button
    const modalAcceptVisible = ref(false);
    function acceptHandleOk(){
        console.log(userSelectionRef);
        storeLibrary.acceptRequests(userSelectionRef.value.id);
        modalAcceptVisible.value=false;
    }
    function acceptHandleCancel(){
        modalAcceptVisible.value=false;
    }

    //for viewing reason
    const modalReasonVisible = ref(false);
    function showReason(request){
        modalReasonVisible.value=true;
        storeReason.value = request.reason;
    }
    function reasonHandleCancel(){
        modalReasonVisible.value=false;
    }

    //drawer logic
    //Add drawer
    const addVisible = ref(false);
    const showAddDrawer = () => {
        addVisible.value = true;
    };

    //function that gets called when user selects an option from the dropdown in the add form
    const onSelect = (value) => {
        for (var ar in booksJsonArr.value){
            if (booksJsonArr.value[ar].title === value){
                formState.bookIsbn = booksJsonArr.value[ar].isbn;
                formState.bookAuthor = booksJsonArr.value[ar].author;
                formState.bookImage = booksJsonArr.value[ar].image;

            }
        }
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

    //Reject drawer
    const rejectVisible = ref(false);
    const showRejectDrawer = (record) => {
        refRequestSelected.value = record;
        rejectVisible.value = true;
    };
    //method called when edit form has been filled correctly
    const onFinishReject = () => {
        storeLibrary.rejectRequests(refRequestSelected.value.id, formStateReject.rejectionReason);
        rejectVisible.value=false;
        formStateReject.rejectionReason = '';
    };

    //BUTTON LOGIC
    //Function to accept the request
    function acceptRequest(record){
        userSelectionRef.value = record;
        modalAcceptVisible.value = true;
    }

    //toggle logic
    function rejectToggled(){
        storeLibrary.getToggledRequests();
    }
    function acceptToggled(){
        storeLibrary.getToggledRequests();
    }

    //filterUser Logic
    function filterUserRequests(){
        storeLibrary.getFilteredUserRequests(filteredUser.value);

    }
    function resetFilterUserRequests(){
        if (filteredUser.value === ''){
            storeLibrary.getRequests();
        }
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
