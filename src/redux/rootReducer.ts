import { combineReducers } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/auth/userSlice';
import taskReducer from '../features/task/taskSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    task: taskReducer
})

export default rootReducer;