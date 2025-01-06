import { db } from '@/services/firestore';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';

// Define Task interface
interface Task {
    id?: string; // Firestore document ID
    title: string;
    description: string;
    category: string;
    dueDate: string;
    taskStatus: string;
    fileUrl: string;
    userId: string;
}

interface TasksState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const initialState: TasksState = {
    tasks: [],
    loading: false,
    error: null,
};


// Fetch tasks from Firestore
export const fetchTasksFromFirestore = createAsyncThunk(
    'tasks/fetchTasks',
    async (userId: string) => {
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category,
                dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : '', // Safely handle dueDate
                taskStatus: data.taskStatus,
                fileUrl: data.fileUrl,
                userId: data.userId,
            });
        });

        return tasks;
    }
);


// Add Task to Firestore
export const addTaskToFirestore = createAsyncThunk(
    'tasks/addTaskToFirestore',
    async (taskData: Task, { rejectWithValue }) => {
        try {
            const docRef = await addDoc(collection(db, 'tasks'), taskData);
            return { ...taskData, id: docRef.id };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Update Task Status in Firestore
export const updateTaskStatusInFirestore = createAsyncThunk(
    'tasks/updateTaskStatusInFirestore',
    async ({ id, taskStatus }: { id: string, taskStatus: string }, { rejectWithValue }) => {
        try {
            const taskRef = doc(db, 'tasks', id);
            await updateDoc(taskRef, { taskStatus });
            return { id, taskStatus };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete Task from Firestore
export const deleteTasksFromFirestore = createAsyncThunk(
    'tasks/deleteTasksFromFirestore',
    async (ids: string[], { rejectWithValue }) => {
        try {
            // Use Promise.all to delete all tasks in parallel
            await Promise.all(ids.map(async (id) => {
                const taskRef = doc(db, 'tasks', id);
                await deleteDoc(taskRef);
            }));

            // Return the list of deleted IDs
            return ids;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


// Create tasks slice
const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        // You can add additional actions here like updating a task in local state
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksFromFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTasksFromFirestore.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.tasks = action.payload;
                state.loading = false;
            })
            .addCase(fetchTasksFromFirestore.rejected, (state) => {
                state.loading = false;
            })
            // Add Task to Firestore
            .addCase(addTaskToFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(addTaskToFirestore.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks.push(action.payload);
            })
            .addCase(addTaskToFirestore.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Task Status
            .addCase(updateTaskStatusInFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTaskStatusInFirestore.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.tasks.findIndex((task) => task.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index].taskStatus = action.payload.taskStatus;
                }
            })
            .addCase(updateTaskStatusInFirestore.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Task
            .addCase(deleteTasksFromFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteTasksFromFirestore.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = state.tasks.filter((task) => task.id && !action.payload.includes(task.id));
            })
            .addCase(deleteTasksFromFirestore.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default tasksSlice.reducer;
