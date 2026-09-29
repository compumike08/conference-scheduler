import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import registerReducer from '../features/register/registerSlice';
import loginReducer from '../features/login/loginSlice';
import userReducer from '../features/user/userSlice';
import memberReducer from '../features/member/memberSlice';
import adminDashboardReducer from '../features/admin/adminDashboardSlice';
import locationReducer from '../features/location/locationSlice';

export const store = configureStore({
  reducer: {
    registerUser: registerReducer,
    login: loginReducer,
    user: userReducer,
    member: memberReducer,
    adminDashboard: adminDashboardReducer,
    location: locationReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
