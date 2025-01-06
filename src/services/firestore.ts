// services/firestore.ts

import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from './firebaseConfig';

export const db = getFirestore(app);

export const saveTaskToFirestore = async (task: {
    title: string;
    description: string;
    category: string;
    dueDate: string;
    taskStatus: string;
    fileUrl: string;
    userId: string;
}) => {
    try {
        const tasksRef = collection(db, 'tasks');
        const docRef = await addDoc(tasksRef, task);
        console.log('Task saved with ID:', docRef.id);
    } catch (error) {
        console.error('Error saving task:', error);
    }
};
