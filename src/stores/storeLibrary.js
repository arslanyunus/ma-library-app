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
        };
    },
    actions: {
        async getBooks() {
            const queryBooks = query(collection(db, 'books'), where('deleted_at', '==', ''));
            onSnapshot(queryBooks,(querySnapshot)=> {
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
    },

});
