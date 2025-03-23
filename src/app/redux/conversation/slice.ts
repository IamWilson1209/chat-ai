import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation } from '../conversation/conversation-type';

export interface ConversationState {
  selectedConversation: Conversation | null;
}

const initialState: ConversationState = {
  selectedConversation: null,
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setSelectedConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.selectedConversation = action.payload;
    },
  },
});

export const { setSelectedConversation } = conversationSlice.actions;
export default conversationSlice.reducer;