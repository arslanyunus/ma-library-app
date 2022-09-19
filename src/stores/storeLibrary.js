import { defineStore } from 'pinia';
import { collection, getDocs, addDoc, query, where, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/init';
import { message } from 'ant-design-vue';
//const booksCollectionRef = collection(db, 'books');

export const useStoreLibrary = defineStore('storeLibrary', {
    state: () => {
        return {
            books: [],
            userLogged: '',
            booksTemp: [],
            booksLoaded: false,
            requestsLoaded: false,
            requests: [],
            checkedReserved: false,
            checkedAvailable: false,
            checkedAccepted: false,
            checkedRejected: false,

        };
    },
    actions: {
        async getBooks() {
            const queryBooks = query(collection(db, 'books'), where('deleted_at', '==', ''));
            onSnapshot(queryBooks,(querySnapshot)=> {
                this.checkedAvailable = false;
                this.checkedReserved = false;
                this.books = [];
                querySnapshot.forEach((doc) => {
                    let book = {
                        id: doc.id,
                        image_url: doc.data().image_url,
                        title: doc.data().title,
                        isbn: doc.data().isbn,
                        author: doc.data().author,
                        status: doc.data().status,
                        added_at: doc.data().added_at,
                        added_by: doc.data().added_by,
                        loaned_by: doc.data().loaned_by,
                        loaned_at: doc.data().loaned_at,
                    };
                    this.books.push(book);
                });
                this.booksLoaded=true;
            });

            // const queryBooks = query(collection(db, 'books'), where('deleted_at', '==', ''));
            // const querySnapshot = await getDocs(queryBooks);
            // querySnapshot.forEach((doc) => {
            //     let book = {
            //         id: doc.id,
            //         image_url: doc.data().image_url,
            //         title: doc.data().title,
            //         isbn: doc.data().isbn,
            //         author: doc.data().author,
            //         status: doc.data().status,
            //         added_at: doc.data().added_at,
            //         added_by: doc.data().added_by,
            //         loaned_by: doc.data().loaned_by,
            //         loaned_at: doc.data().loaned_at,
            //     };
            //     this.books.push(book);
            // });
        },
        async addBooks(title, isbn, author, imageUrl) {
            let currentDate = new Date(),
                addedtime = currentDate.toString();

            const docRef = await addDoc(collection(db, 'books'), {
                image_url: imageUrl,
                title: title,
                isbn: isbn,
                author: author,
                status: 'AVAILABLE',
                added_by: this.userLogged,
                added_at: addedtime,
                deleted_by: '',
                deleted_at: '',
                loaned_by: '',
                loaned_at: '',
                returned_at: '',
            });

            message.success('Successfully added book');

            console.log('Document written with ID: ', docRef.id);
        },
        async deleteBooks(idToDelete){
            let currentDate = new Date(),
                addedtime = currentDate.toString();
            await setDoc(doc(db,'books', idToDelete), {
                deleted_at: addedtime,
                deleted_by: this.userLogged,

            }, { merge: true });

            message.success('Successfully deleted book');

        },
        async editBooks(idToDelete, title, isbn, author, imageUrl){
            await setDoc(doc(db,'books', idToDelete), {
                title: title,
                isbn: isbn,
                author: author,
                imageUrl: imageUrl,
            }, { merge: true });

            message.success('Successfully edited book');

        },
        async checkoutBooks(idToCheckout){
            let currentDate = new Date(),
                addedtime = currentDate.toString();
            await setDoc(doc(db,'books', idToCheckout), {
                loaned_by: this.userLogged,
                loaned_at: addedtime,
                status: 'RESERVED',
            }, { merge: true });

            message.success('Successfully checked out book');

        },
        async returnBooks(idToReturn){
            let currentDate = new Date(),
                addedtime = currentDate.toString();
            await setDoc(doc(db,'books', idToReturn), {
                status: 'AVAILABLE',
                returned_at: currentDate,
            }, { merge: true });
            message.success('Successfully returned book');
        },
        async getToggledBooks() {
            let queryRequests = query(collection(db, 'books'), where('status', '==', 'RESERVED'));
            this.booksLoaded = false;
            if (this.checkedAvailable && this.checkedReserved){
                queryRequests = query(collection(db, 'books'), where('status', '!=', ''));
            } else if (!this.checkedAvailable && this.checkedReserved){
                queryRequests = query(collection(db, 'books'), where('status', '==', 'AVAILABLE'));
            } else if (!this.checkedAvailable && !this.checkedReserved){
                queryRequests = query(collection(db, 'books'), where('status', '!=', ''));
            }
            const querySnapshot = await getDocs(queryRequests);
            this.books=[];
            querySnapshot.forEach((doc) => {
                let book = {
                    id: doc.id,
                    image_url: doc.data().image_url,
                    title: doc.data().title,
                    isbn: doc.data().isbn,
                    author: doc.data().author,
                    status: doc.data().status,
                    added_at: doc.data().added_at,
                    added_by: doc.data().added_by,
                    loaned_by: doc.data().loaned_by,
                    loaned_at: doc.data().loaned_at,
                };
                this.books.push(book);
            });
            this.booksLoaded = true;
        },
        async getFilteredUserBooks(userEmail) {
            let queryRequests = query(collection(db, 'books'), where('loaned_by', '==', userEmail), where('status', '!=', 'AVAILABLE'));
            this.booksLoaded = false;
            const querySnapshot = await getDocs(queryRequests);
            this.books=[];
            querySnapshot.forEach((doc) => {
                let book = {
                    id: doc.id,
                    image_url: doc.data().image_url,
                    title: doc.data().title,
                    isbn: doc.data().isbn,
                    author: doc.data().author,
                    status: doc.data().status,
                    added_at: doc.data().added_at,
                    added_by: doc.data().added_by,
                    loaned_by: doc.data().loaned_by,
                    loaned_at: doc.data().loaned_at,
                };
                this.books.push(book);
            });
            this.booksLoaded = true;
        },
        async addUsers(id, name, email){
            let currentDate = new Date(),
                addedtime = currentDate.toString();
            await setDoc(doc(db,'users', id), {
                id: id,
                name: name,
                email: email,
                created_at: addedtime,
            }, { merge: true });

            message.success('Successfully edited book');

        },
        async getRequests() {
            this.requestsLoaded = false;
            this.checkedAccepted = false;
            this.checkedRejected = false;
            const queryRequests = query(collection(db, 'requests'), where('status', '==', 'PENDING'));
            onSnapshot(queryRequests, (querySnapshot) => {
                this.requests = [];
                querySnapshot.forEach((doc) => {
                    let request= {
                        id: doc.id,
                        title: doc.data().title,
                        isbn: doc.data().isbn,
                        amazon_link: doc.data().amazon_link,
                        reason: doc.data().reason,
                        status: doc.data().status,
                        requested_by: doc.data().requested_by,

                    };
                    this.requests.push(request);
                });
                this.requestsLoaded = true;
            });
        },
        async addRequests(title, isbn, amazonlink, reason) {
            let currentDate = new Date(),
                addedtime = currentDate.toString();

            const docRef = await addDoc(collection(db, 'requests'), {
                title: title,
                isbn: isbn,
                reason: reason,
                amazon_link: amazonlink,
                requested_by: this.userLogged,
                requested_at: addedtime,
                rejected_by: '',
                rejected_at: '',
                accepted_by: '',
                accepted_at: '',
                status: 'PENDING',
                reject_reason: '',
            });

            message.success('Request has been submitted!');

            console.log('Document written with ID: ', docRef.id);
        },
        async acceptRequests(idToAccept){
            let currentDate = new Date(),
                addedtime = currentDate.toString();

            console.log(idToAccept);
            await setDoc(doc(db,'requests', idToAccept), {
                accepted_by: this.userLogged,
                accepted_at: addedtime,
                status: 'ACCEPTED',
            }, { merge: true });

            message.success('Request Accepted');

        },
        async rejectRequests(idToReject, reject_reason){
            let currentDate = new Date(),
                addedtime = currentDate.toString();
            await setDoc(doc(db,'requests', idToReject), {
                rejected_at: addedtime,
                rejected_by: this.userLogged,
                reject_reason: reject_reason,
                status: 'REJECTED',

            }, { merge: true });

            message.success('Request has been rejected');

        },
        async getToggledRequests() {
            let queryRequests = query(collection(db, 'requests'), where('status', '==', 'REJECTED'));
            this.requestsLoaded = false;
            if (this.checkedRejected && this.checkedAccepted){
                console.log('im here');
                queryRequests = query(collection(db, 'requests'), where('status', '!=', 'PENDING'));
            } else if (!this.checkedRejected && this.checkedAccepted){
                queryRequests = query(collection(db, 'requests'), where('status', '==', 'ACCEPTED'));
            } else if (!this.checkedRejected && !this.checkedAccepted){
                queryRequests = query(collection(db, 'requests'), where('status', '==', 'PENDING'));
            }
            const querySnapshot = await getDocs(queryRequests);
            this.requests=[];
            querySnapshot.forEach((doc) => {
                let request = {
                    id: doc.id,
                    title: doc.data().title,
                    isbn: doc.data().isbn,
                    amazon_link: doc.data().amazon_link,
                    reason: doc.data().reason,
                    status: doc.data().status,
                    requested_by: doc.data().requested_by,
                };
                this.requests.push(request);
            });
            this.requestsLoaded = true;
        },
        async getFilteredUserRequests(filteredUser) {
            let queryRequests = query(collection(db, 'requests'), where('requested_by', '==', filteredUser));
            this.requestsLoaded = false;

            const querySnapshot = await getDocs(queryRequests);
            this.requests=[];
            querySnapshot.forEach((doc) => {
                let request = {
                    id: doc.id,
                    title: doc.data().title,
                    isbn: doc.data().isbn,
                    amazon_link: doc.data().amazon_link,
                    reason: doc.data().reason,
                    status: doc.data().status,
                    requested_by: doc.data().requested_by,
                };
                this.requests.push(request);
            });
            this.requestsLoaded = true;
        },
    },

});
