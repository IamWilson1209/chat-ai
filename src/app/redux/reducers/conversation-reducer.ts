import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Id } from '../../../../convex/_generated/dataModel';

// 定義 Conversation 類型
export type Conversation = {
  _id: Id<'conversations'>;
  image?: string;
  participants: Id<'users'>[];
  isGroup: boolean;
  name?: string;
  groupImage?: string;
  groupName?: string;
  admin?: Id<'users'>;
  isOnline?: boolean;
  lastMessage?: {
    _id: Id<'messages'>;
    conversation: Id<'conversations'>;
    content: string;
    sender: Id<'users'>;
  };
};

// 定義 Slice 的初始狀態
interface ConversationsState {
  selectedConversation: Conversation | null;
}

const initialState: ConversationsState = {
  selectedConversation: null,
};

// 創建 Slice
const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    // 設定選擇的對話
    setSelectedConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.selectedConversation = action.payload;
    },
  },
});

// 匯出 Reducer 和 Action
export const { setSelectedConversation } = conversationsSlice.actions;
export default conversationsSlice.reducer;
