'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, X } from 'lucide-react';
import MessageInput from './_components/message-input';
import MessageContainer from './_components/message-container';
import ChatPlaceHolder from '@/components/home/(left-dashboard)/_components/chat-placeholder';
import GroupMembersDialog from '../_components/group-members-dialog';
import { useConversationStore } from '@/store/chat-store';
import { useConvexAuth } from 'convex/react';
import Skeleton from '../_components/skeleton';

const RightDashboard = () => {
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();
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
            {/* make sure click the X button, chatbox will close automatically */}
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => setSelectedConversation(null)}
            />
          </div>
        </div>
      </div>
      {/* CHAT MESSAGES */}
      <MessageContainer />

      {/* INPUT */}
      <MessageInput />
    </div>
  );
};
export default RightDashboard;
