import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import authReducer from './slices/authSlice';

// 1. Create the root reducer (combining all slices)
const rootReducer = combineReducers({
  auth: authReducer,
  // tickets: ticketReducer, // Future slices go here
  // wallet: walletReducer,
});

// 2. Configuration for Persistence
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist the auth slice
};

// 3. Export the persisted reducer
export const persistedReducer = persistReducer(persistConfig, rootReducer);
