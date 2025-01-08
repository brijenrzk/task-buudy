import { db } from '@/services/firestore';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, arrayRemove, orderBy, limit } from 'firebase/firestore';
import axios from "axios";

// Define Task interface
interface Task {
    id?: string; // Firestore document ID
    title: string;
    description: string;
    category: string;
    dueDate: string;
    taskStatus: string;
    fileUrl: Array<string>;
    userId: string;
    taskHistory: Array<Object>;
}

interface TasksState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    viewTaskModal: boolean;
    taskView: string
    uploadedImages: Array<any>,
    uploadStatus: string,
    uploadError: any,
    deleteStatus: string,
    updateImages: Array<any>,
    updateStatus: string,
    updateError: any,
    sort: string
}
interface UploadResponse {
    secure_url: string;
}


const initialState: TasksState = {
    tasks: [],
    loading: false,
    error: null,
    viewTaskModal: false,
    taskView: "list",
    uploadedImages: [],
    uploadStatus: "idle",
    uploadError: null,
    deleteStatus: 'idle',
    updateImages: [],
    updateStatus: "idle",
    updateError: null,
    sort: "asc"
};



// Fetch tasks from Firestore
export const fetchTasksFromFirestore = createAsyncThunk(
    'tasks/fetchTasks',
    async (userId: string) => {
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', userId), orderBy("dueDate"), limit(100));
        const querySnapshot = await getDocs(q);

        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category,
                dueDate: data.dueDate, // Safely handle dueDate
                taskStatus: data.taskStatus,
                fileUrl: data.fileUrl,
                userId: data.userId,
                taskHistory: data.taskHistory
            });
        });

        return tasks;
    }
);

//Upload file to cloudinary
export const uploadImagesToCloudinary = createAsyncThunk<
    string[],
    File[],
    { rejectValue: string }
>(
    'tasks/uploadImagesToCloudinary',
    async (files, { rejectWithValue }) => {
        try {
            const uploadPromises = files.map((file) => {
                console.log("files", file)
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY)

                return axios.post<UploadResponse>(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData
                );
            });

            const responses = await Promise.all(uploadPromises);
            return responses.map((response) => response.data.secure_url); // Return an array of URLs
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
)


//Update file to cloudinary
export const updateImagesToCloudinary = createAsyncThunk<
    string[],
    File[],
    { rejectValue: string }
>(
    'tasks/updateImagesToCloudinary',
    async (files, { rejectWithValue }) => {
        try {
            const uploadPromises = files.map((file) => {
                console.log("files", file)
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY)

                return axios.post<UploadResponse>(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData
                );
            });

            const responses = await Promise.all(uploadPromises);
            return responses.map((response) => response.data.secure_url); // Return an array of URLs
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
)

// Delete Image in Firestore
export const deleteImageInFirestore = createAsyncThunk(
    'tasks/deleteImageInFirestore',
    async ({ id, url }: { id: string, url: string }, { rejectWithValue }) => {
        try {
            const taskRef = doc(db, 'tasks', id);
            await updateDoc(taskRef, {
                fileUrl: arrayRemove(url),
            });
            return { id, url }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
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

// Update Task to Firestore
export const updateTaskToFirestore = createAsyncThunk(
    'tasks/updateTaskToFirestore',
    async ({ id, taskData }: { id: string, taskData: Task }, { rejectWithValue }) => {
        try {
            const taskRef = doc(db, 'tasks', id);
            await updateDoc(taskRef, {
                title: taskData.title,
                description: taskData.description,
                category: taskData.category,
                dueDate: taskData.dueDate,
                taskStatus: taskData.taskStatus,
                fileUrl: taskData.fileUrl,
                taskHistory: taskData.taskHistory
            })
            return { id, taskData };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Update Task Status in Firestore
export const updateTaskStatusInFirestore = createAsyncThunk(
    'tasks/updateTaskStatusInFirestore',
    async ({ id, taskStatus, taskHistory }: { id: string, taskStatus: string, taskHistory: Array<Object> }, { rejectWithValue }) => {
        try {
            const taskRef = doc(db, 'tasks', id);
            await updateDoc(taskRef, { taskStatus, taskHistory });
            return { id, taskStatus };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Update Bulk Task Status in Firestore
export const updateBulkTaskStatusInFirestore = createAsyncThunk(
    'tasks/updateBulkTaskStatusInFirestore',
    async ({ selectedTasks, taskStatus }: { selectedTasks: Task[], taskStatus: string }, { rejectWithValue }) => {
        try {
            await Promise.all(selectedTasks.map(async (task) => {
                if (task.id) {
                    const taskRef = doc(db, 'tasks', task.id);
                    const currentDate = new Date().toISOString()
                    const updatedHistory = [...task.taskHistory, { activity: `You Change the type status from ${task.taskStatus} to ${taskStatus}`, timestamp: currentDate }]
                    await updateDoc(taskRef, { taskStatus, taskHistory: updatedHistory });
                }
            }));
            const ids = selectedTasks.map((task) => task.id)
            return { ids, taskStatus };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete Task from Firestore
export const deleteTasksFromFirestore = createAsyncThunk(
    'tasks/deleteTasksFromFirestore',
    async (tasks: Task[], { rejectWithValue }) => {
        try {
            // Use Promise.all to delete all tasks in parallel
            await Promise.all(tasks.map(async (task) => {
                if (task.id) {
                    const taskRef = doc(db, 'tasks', task.id);
                    await deleteDoc(taskRef);
                }

            }));
            const ids = tasks.map((task) => task.id)
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
        modalAction: (state, action: PayloadAction<any>) => {
            state.viewTaskModal = action.payload
        },
        taskViewAction: (state, action: PayloadAction<string>) => {
            state.taskView = action.payload
        },
        sortTaskAction: (state, action: PayloadAction<string>) => {
            const newTask = [...state.tasks]
            if (action.payload === "asc") {
                state.sort = "asc"
                newTask.sort(function (a: any, b: any) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                });
            } else {
                state.sort = "des"
                newTask.sort(function (a: any, b: any) {
                    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                });
            }

            state.tasks = newTask;
        }
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
                const newTask = [...state.tasks, action.payload]

                newTask.sort(function (a: any, b: any) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                });
                state.tasks = newTask;

            })
            .addCase(addTaskToFirestore.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            //Update Task to Firestore
            .addCase(updateTaskToFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTaskToFirestore.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.tasks.findIndex((task) => task.id === action.payload.id);
                state.tasks[index] = action.payload.taskData;
            })
            .addCase(updateTaskToFirestore.rejected, (state, action) => {
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
            //Update Bulk Task
            .addCase(updateBulkTaskStatusInFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateBulkTaskStatusInFirestore.fulfilled, (state, action) => {
                state.loading = false;
                const { ids, taskStatus } = action.payload;

                state.tasks = state.tasks.map((task) => {
                    if (task.id && ids.includes(task.id)) {
                        return { ...task, taskStatus: taskStatus };
                    }
                    return task;
                });
            })
            .addCase(updateBulkTaskStatusInFirestore.rejected, (state, action) => {
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
            })
            //Upload image
            .addCase(uploadImagesToCloudinary.pending, (state) => {
                state.loading = true;
                state.uploadStatus = "uploading";
                state.uploadError = null;
            })
            .addCase(uploadImagesToCloudinary.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.loading = false
                state.uploadStatus = "succeeded";
                state.uploadedImages = action.payload;
            })
            .addCase(uploadImagesToCloudinary.rejected, (state, action) => {
                state.uploadStatus = "failed";
                state.uploadError = action.payload || "Unknown error occurred";
            })
            //Update image
            .addCase(updateImagesToCloudinary.pending, (state) => {
                state.loading = true;
                state.updateStatus = "uploading";
                state.updateError = null;
            })
            .addCase(updateImagesToCloudinary.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.loading = false;
                state.updateStatus = "succeeded";
                state.updateImages = action.payload;
            })
            .addCase(updateImagesToCloudinary.rejected, (state, action) => {
                state.loading = false;
                state.updateStatus = "failed";
                state.updateError = action.payload || "Unknown error occurred";
            })
            //Delete Image from Firestore
            .addCase(deleteImageInFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteImageInFirestore.fulfilled, (state, action) => {
                state.loading = false;
                const { id, url } = action.payload;

                // Find the task and remove the image URL from its fileUrl array
                const taskIndex = state.tasks.findIndex(task => task.id === id);
                if (taskIndex !== -1) {
                    state.tasks[taskIndex].fileUrl = state.tasks[taskIndex].fileUrl.filter(fileUrl => fileUrl !== url);
                }
            })
            .addCase(deleteImageInFirestore.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    }
});
export const { modalAction, taskViewAction, sortTaskAction } = tasksSlice.actions;

export default tasksSlice.reducer;
