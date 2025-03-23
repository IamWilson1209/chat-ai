'use client';
import { SlidersHorizontal, SearchCheck, BotMessageSquare } from 'lucide-react';
import { Input } from './ui/input';
import Conversation from './Conversation';
import { UserButton } from '@clerk/nextjs';
import UserListDialog from './UserListDialog';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/stores';
import { setSelectedConversation } from '@/app/redux/conversation/slice';
import ThemeSwitch from './ThemeSwitch';
import Skeleton from './Skeleton';

const LeftDashboard = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  /* 
    Docs: https://docs.convex.dev/tutorial/
    1. useQuery to get the conversations from convex db
    2. use isAuthenticated ? undefined : "skip" to prevent server auth error 
  */
  const conversations = useQuery(
    api.functions.conversations.getUserConversations,
    isAuthenticated ? undefined : 'skip'
  );

  // 從 Redux Store 獲取狀態和 Dispatch
  const selectedConversation = useSelector(
    (state: RootState) => state.conversation.selectedConversation
  );
  const dispatch = useDispatch();

  // 如果用戶被踢出，更新 Redux 狀態
  useEffect(() => {
    const conversationIds = conversations?.map(
      (conversation) => conversation._id
    );
    if (
      selectedConversation &&
      conversationIds &&
      !conversationIds.includes(selectedConversation._id)
    ) {
      dispatch(setSelectedConversation(null));
    }
  }, [conversations, selectedConversation, dispatch]);

  /* Changed to loading skeleton */
  if (isLoading) {
    return (
      <div className="w-1/4 border-gray-800 border-r">
        <div className="sticky top-0 bg-gray-primary z-10">
          {/* Header Skeleton */}
          <div className="flex justify-between bg-gray-primary p-3 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
          {/* Search Skeleton */}
          <div className="p-3 flex items-center">
            <Skeleton className="h-10 w-full mx-3" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        {/* Chat List Skeleton */}
        <div className="my-3 flex flex-col gap-3 max-h-[80%] max-w-[90%] ml-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/4 border-gray-600 border-r">
      <div className="sticky top-0 bg-left-dashboard z-10">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3 items-center">
          <UserButton />
          <div className="flex items-center gap-3">
            <BotMessageSquare className="cursor-pointer" />
            {isAuthenticated && <UserListDialog />}
            <ThemeSwitch />
          </div>
        </div>
        <div className="p-3 flex items-center">
          {/* Search */}
          <div className="relative h-10 mx-3 flex-1">
            <SearchCheck
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search for your chat"
              className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
            />
          </div>
          <SlidersHorizontal className="cursor-pointer" />
        </div>
      </div>

      {/* Conversation List */}
      <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
        {/* Conversations will go here */}
        {conversations?.map((conversation) => (
          <Conversation key={conversation._id} conversation={conversation} />
        ))}

        {conversations?.length === 0 && (
          <>
            <p className="text-center text-gray-500 text-sm mt-3">
              No conversations yet
            </p>
            <p className="text-center text-gray-500 text-sm mt-3 ">
              Start your first chat with family, friends, and AI!!
            </p>
          </>
        )}
      </div>
    </div>
  );
};
export default LeftDashboard;
