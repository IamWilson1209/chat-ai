/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMessage, useConversationStore } from '@/store/chat-store';
import { useMutation } from 'convex/react';
import { Ban, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../convex/_generated/api';
import React from 'react';

type ChatAvatarActionsProps = {
  message: IMessage;
  me: any;
};

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();

  const isMember = selectedConversation?.participants.includes(
    message.sender._id
  );
  const kickUser = useMutation(
    api.functions.conversations.deleteUserFromConversation
  );
  const createConversation = useMutation(
    api.functions.conversations.createConversation
  );
  const fromAI = message.sender?.name === 'ChatGPT';
  const isGroup = selectedConversation?.isGroup;

  const handleKickUser = async (e: React.MouseEvent) => {
    if (fromAI) return;
    /* 
      If don't use e.stopPropagation, after kicked a user out
      from the selected conversation, 
      our conversation will change to private chat bubble with kicked user.
    */
    e.stopPropagation();
    if (!selectedConversation) return;
    try {
      /* update convex db status by mutation */
      await kickUser({
        conversationId: selectedConversation._id,
        userId: message.sender._id,
      });

      /* 
        update global state of selectedConversation
        when an user has been kicked
      */
      setSelectedConversation({
        ...selectedConversation,
        participants: selectedConversation.participants.filter(
          (id) => id !== message.sender._id
        ),
      });
    } catch (error) {
      toast.error('Failed to kick user');
    }
  };

  const handleCreateConversation = async () => {
    if (fromAI) return;

    try {
      /* update convex db status by mutation */
      const conversationId = await createConversation({
        isGroup: false,
        participants: [me._id, message.sender._id],
      });
      /* 
        update global state of selectedConversation
        when a specific conversation has been created
        turn to new conversation with that user
      */
      setSelectedConversation({
        _id: conversationId,
        name: message.sender.name,
        participants: [me._id, message.sender._id],
        isGroup: false,
        isOnline: message.sender.isOnline,
        image: message.sender.image,
      });
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  return (
    /* 
      redirect the conversation from group message to 
      one-on-one chat-bubble with specific user
      when clicking that user's username
    */
    <div
      className="text-[11px] flex gap-4 justify-between font-bold cursor-pointer group"
      onClick={handleCreateConversation}
    >
      {/* 
        Click user's name should change to the responding chat, 
        only when member is in a group, not in one-on-one chat
       */}
      {isGroup && message.sender.name}
      {/* can't kick ai from group chat */}
      {!isMember && !fromAI && isGroup && (
        <Ban size={16} className="text-red-500" />
      )}
      {/* Kick out user button */}
      {isGroup && isMember && selectedConversation?.admin === me._id && (
        /* opacity default 0, hover: 100 to show Logout button */
        <LogOut
          size={16}
          className="text-red-500 opacity-0 group-hover:opacity-100"
          onClick={handleKickUser}
        />
      )}
    </div>
  );
};
export default ChatAvatarActions;
