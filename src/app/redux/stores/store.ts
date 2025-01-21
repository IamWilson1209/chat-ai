import { configureStore } from '@reduxjs/toolkit';
import conversationsReducer from '../reducers/conversation-reducer';


// 建立 Redux Store
export const store = configureStore({
  reducer: {
    conversations: conversationsReducer,
  },
});

// 定義 RootState 和 AppDispatch 類型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

