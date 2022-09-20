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
        <!--       MODAL FOR NOTIFY BUTTON     -->
        <a-modal v-model:visible="modalNotifyVisible" title="Notify User"
                 @ok="notifyHandleOk"
                 @cancel="notifyHandleCancel"
        >
            <p>Are you sure you want to notify the user to return the book?</p>
        </a-modal>
        <!--       MODAL FOR DELETE BUTTON     -->
        <a-modal v-model:visible="modalDeleteVisible" title="Delete Book"
                 @ok="deleteHandleOk"
                 @cancel="deleteHandleCancel"
        >
            <p>Are you sure you want to delete the selected book?</p>
        </a-modal>
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
                <a-button title="Add Book"
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
            <a-table-column key="status" title="Status" data-index="status">
                <template #default="{ record }">
                    <span v-if="record.status === 'AVAILABLE'" class ="text-green-500">
                        {{record.status}}
                    </span>
                    <span class= "text-rose-700" v-if="record.status === 'RESERVED'">
                        {{record.status}}
                    </span>
                </template>
            </a-table-column>
            <a-table-column key="action" title="Action">
                <template #default="{ record }">
                    <span>
                        <a-button type="primary" @click="showEditDrawer(record)">Edit</a-button>
                        <a-divider type="vertical"/>
                        <a-button type="primary" danger @click="deleteBook(record)">Delete</a-button>
                        <template v-if= "record.status === 'AVAILABLE'">
                            <a-button type = "primary" class = "ml-3"  @click="checkoutBook(record)">Checkout</a-button>
                        </template>
                        <template v-if= "(record.loaned_by === currentUser) && (record.status === 'RESERVED')">
                            <a-button type = "primary" class = "ml-3"  @click="returnBook(record)">Return</a-button>
                        </template>
                        <template v-if= "(record.loaned_by != currentUser) && (record.status === 'RESERVED')">
                            <a-button type = "primary" class = "ml-3"  @click="notifyUser(record)">Notify</a-button>
                        </template>
                    </span>
                </template>
            </a-table-column>
        </a-table>
        <!--        DRAWER FOR ADD BUTTON        -->
        <a-drawer
            v-model:visible="addVisible"
            class="custom-class"
            title="Add Books"
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
                        name="bookTitle"
                        :rules="[{ required: true, message: 'Please input the Book Title!' }]"
                    >
                        <a-auto-complete
                            v-model:value="formState.bookTitle"
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
                        name="bookIsbn"
                        :rules="[{ required: true, message: 'Please input the name of the author!' }]"
                    >
                        <a-input v-model:value="formState.bookIsbn"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="Author"
                        name="bookAuthor"
                        :rules="[{ required: true, message: 'Please input the name of the author!' }]"
                    >
                        <a-input v-model:value="formState.bookAuthor"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="Image URL"
                        name="bookImage"
                        :rules="[{ required: true, message: 'Please input the url for the book image' }]"
                    >
                        <a-input v-model:value="formState.bookImage"/>
                    </a-form-item>
                    <a-image
                        class = "ml-[120px]"
                        :width="200"
                        v-bind:src="formState.bookImage"
                        :preview=false
                    />
                    <br/>
                    <a-button class = "ml-[120px] mt-10 mb-10" type="primary"
                              size="large"
                              html-type="submit"
                    >Add</a-button>
                </a-form>
            </div>
        </a-drawer>
        <!--        DRAWER FOR EDIT BUTTON        -->
        <a-drawer
            v-model:visible="editVisible"
            class="custom-class"
            title="Edit Book"
            placement="right"
            width = 800
            @after-visible-change="afterVisibleChange"
        >
            <div class="">
                <!--        FORM FOR EDIT BOOKS         -->
                <a-form
                    class=" w-6/12 mt-12"
                    :model="formStateEdit"
                    name="basic"
                    :label-col="{ span: 8}"
                    :wrapper-col="{ span: 19}"
                    autocomplete="off"
                    @finish="onFinishEdit"
                    @finishFailed="onFinishFailedEdit"
                >

                    <a-form-item
                        class="mb-10"
                        label="Title"
                        name="bookTitle"
                        :rules="[{ required: true, message: 'Please input the Book Title!' }]"
                    >
                        <a-input v-model:value="formStateEdit.bookTitle"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="ISBN"
                        name="bookIsbn"
                        :rules="[{ required: true, message: 'Please input the name of the author!' }]"
                    >
                        <a-input v-model:value="formStateEdit.bookIsbn"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="Author"
                        name="bookAuthor"
                        :rules="[{ required: true, message: 'Please input the name of the author!' }]"
                    >
                        <a-input v-model:value="formStateEdit.bookAuthor"/>
                    </a-form-item>
                    <a-form-item
                        class="mb-10"
                        label="Image URL"
                        name="bookImage"
                        :rules="[{ required: true, message: 'Please input the url for the book image' }]"
                    >
                        <a-input v-model:value="formStateEdit.bookImage"/>
                    </a-form-item>
                    <a-image
                        class = "ml-[120px]"
                        :width="200"
                        v-bind:src="formStateEdit.bookImage"
                    />
                    <br/>
                    <a-button class = "ml-[120px] mt-10 mb-10" type="primary"
                              size="large"
                              html-type="submit"
                    >Edit</a-button>
                </a-form>
            </div>
        </a-drawer>
    </div>
</template>

<script setup>
    import { useStoreLibrary } from '@/stores/storeLibrary.js';
    import { onMounted, reactive, ref } from 'vue';
    import { PlusOutlined } from '@ant-design/icons-vue';
    import emailjs from '@emailjs/browser';
    import { message } from 'ant-design-vue';

    //initialize store library
    const storeLibrary = useStoreLibrary();

    //shows the spinner in adds button drawer
    const apiFetching = ref(false);
    //storing reference to record when user clicks specific table fields
    const userSelectionRef = ref({});
    const userNotificationRef = ref({});

    //ref for the filtered user input box
    const filteredUser = ref('');

    //debouncer ref for delaying api call
    const debounce = ref(null);
    //retrieves current user from store
    const currentUser = storeLibrary.userLogged;
    //add book options autocomplete
    const options = ref([]);
    const booksJsonArr = ref([]);
    const refBookSelected = reactive({});
    //used to get info from add form
    const formState = reactive({
        bookIsbn: '',
        bookTitle: '',
        bookAuthor: '',
        bookImage: '',
    });
    //used to get info from edit form
    const formStateEdit = reactive({
        bookIsbn: '',
        bookTitle: '',
        bookAuthor: '',
        bookImage: '',
    });

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

    //modal code for the delete button
    const modalDeleteVisible = ref(false);
    async function deleteHandleOk(){
        console.log(userSelectionRef);
        storeLibrary.deleteBooks(userSelectionRef.value.id);
        modalDeleteVisible.value=false;
    }
    function deleteHandleCancel(){
        modalDeleteVisible.value=false;
    }

    //modal code for the notify button
    const modalNotifyVisible = ref(false);
    async function notifyHandleOk(){
        const templateParams = {
            to_email: userNotificationRef.value.loaned_by,
        };
        emailjs.send(import.meta.env.VITE_SERVICE_ID,import.meta.env.VITE_TEMPLATE_ID, templateParams, import.meta.env.VITE_PUBLIC_KEY)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                message.success('User has been notified');
            }, (err) => {
                console.log('FAILED...', err);
                message.error('User could not be notified');
            });
        modalNotifyVisible.value=false;
    }
    function notifyHandleCancel(){
        modalNotifyVisible.value=false;
    }

    //drawer logic
    //Add drawer
    const addVisible = ref(false);
    const showAddDrawer = () => {
        addVisible.value = true;
    };
    //autocomplete books logic
    const onSearch =  async(searchText) => {
        clearTimeout(debounce.value);
        debounce.value = setTimeout(async () => {
            await findBookInfo();
            if (booksJsonArr.value.length > 1){
                console.log(booksJsonArr.value[0]);
                options.value =  [{ value: booksJsonArr.value[0].title }, { value: booksJsonArr.value[1].title }, { value: booksJsonArr.value[2].title }];
            }
        }, 1300);
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
    //function to make an api call and retrieve data about book while user is typing in add form
    async function findBookInfo(){
        if (formState.bookTitle.length > 3){
            booksJsonArr.value=[];
            apiFetching.value=true;
            await fetch(`http://openlibrary.org/search.json?q=${formState.bookTitle}&limit=3`)
                .then(a => a.json())
                .then((response) => {
                    for (let i = 0; i < 3; i++){
                        let tempIsbn = response.docs[i].isbn[0];
                        let temp = {
                            author: response.docs[i].author_name,
                            title: response.docs[i].title,
                            isbn: response.docs[i].isbn[0],
                            image: 'https://covers.openlibrary.org/b/isbn/'+tempIsbn+'-M.jpg',
                        };
                        booksJsonArr.value.push(temp);
                    }
                })
                .catch((error) => {
                    console.log('No such book exists in the records');
                });
            apiFetching.value=false;
        }
    }
    //onFinish add books form method
    const onFinish = () => {
        storeLibrary.addBooks(formState.bookTitle,formState.bookIsbn,formState.bookAuthor,formState.bookImage);
        addVisible.value=false;
        formState.bookTitle = '';
        formState.bookAuthor = '';
        formState.bookIsbn = '';
        formState.bookImage = '';
    };

    //Edit drawer
    const editVisible = ref(false);
    const showEditDrawer = (record) => {
        refBookSelected.value = record;
        editVisible.value = true;
    };
    //method called when edit form has been filled correctly
    const onFinishEdit = () => {
        storeLibrary.editBooks(refBookSelected.value.id, formStateEdit.bookTitle,formStateEdit.bookIsbn,formStateEdit.bookAuthor,formStateEdit.bookImage);
        editVisible.value=false;
        formStateEdit.bookTitle = '';
        formStateEdit.bookAuthor = '';
        formStateEdit.bookIsbn = '';
        formStateEdit.bookImage = '';
    };
    filteredUser.value = '';
    storeLibrary.getBooks();

    //BUTTON LOGIC
    //Function to delete the book called by delete button
    function deleteBook(record){
        userSelectionRef.value = record;
        modalDeleteVisible.value = true;
        filteredUser.value = '';
        storeLibrary.getBooks();

    }
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

    //method to notify user
    function notifyUser(record){
        userNotificationRef.value=record;
        modalNotifyVisible.value = true;
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
