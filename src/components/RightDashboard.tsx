'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, X } from 'lucide-react';
import MessageInput from './MessageInput';
import MessageContainer from './MessageContainer';
import ChatPlaceHolder from '@/components/ChatPlaceHolder';
import GroupMembersDialog from './GroupMembersDialog';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/stores';
import { setSelectedConversation } from '@/app/redux/conversation/slice';
import { useConvexAuth } from 'convex/react';
import Skeleton from './Skeleton';

const RightDashboard = () => {
  const dispatch = useDispatch();
  /* 
    Initial state: 設定 useSelector 
    從 Redux store 選取當前選擇的對話，判斷此 conversation 是否被選中
    根據 conversation._id 檢查當前 conversation 是否為選中狀態
  */
  const selectedConversation = useSelector(
    (state: RootState) => state.conversation.selectedConversation
  );

  const { isLoading } = useConvexAuth();

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="w-3/4 flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-[70vh] w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (!selectedConversation) return <ChatPlaceHolder />;

  const conversationName =
    selectedConversation.groupName || selectedConversation.name;
  const conversationImage =
    selectedConversation.groupImage || selectedConversation.image;

  return (
    <div className="w-3/4 flex flex-col">
      <div className="w-full sticky top-0 z-50">
        <div className="flex justify-between bg-gray-primary p-3">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage
                src={conversationImage || '/placeholder.png'}
                className="object-cover"
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{conversationName}</p>
              {selectedConversation.isGroup && (
                <GroupMembersDialog
                  selectedConversation={selectedConversation}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <a href="/video-call" target="_blank">
              <Video size={23} />
            </a>
            {/* 更新 Redux store 中的 selectedConversation 為當前點擊的 conversation 物件 */}
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => dispatch(setSelectedConversation(null))}
            />
          </div>
        </div>
      </div>
      {/* 更新Redux需要變換的component */}
      <MessageContainer />

      {/* INPUT */}
      <MessageInput />
    </div>
  );
};
export default RightDashboard;
