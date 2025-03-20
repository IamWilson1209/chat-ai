import { formatDate } from '@/libs/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageSeenSvg } from '@/libs/svgs';
import { ImageIcon, Users, VideoIcon } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/stores';
import { setSelectedConversation } from '@/app/redux/conversation/slice';

const Conversation = ({ conversation }: { conversation: any }) => {
  const dispatch = useDispatch();
  const conversationImage = conversation.groupImage || conversation.image;
  const conversationName = conversation.groupName || conversation.name;
  const lastMessage = conversation.lastMessage;
  const lastMessageType = lastMessage?.messageType;
  const me = useQuery(api.functions.users.getMe);

  const selectedConversation = useSelector(
    (state: RootState) => state.conversation.selectedConversation
  );
  const activeBgClass = selectedConversation?._id === conversation._id;

  return (
    <>
      <div
        className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer
					${activeBgClass ? 'bg-gray-tertiary' : ''}
				`}
        onClick={() => dispatch(setSelectedConversation(conversation))}
      >
        <Avatar className="border border-gray-900 overflow-visible relative">
          {conversation.isOnline && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-foreground" />
          )}
          <AvatarImage
            src={conversationImage || '/placeholder.png'}
            className="object-cover rounded-full"
          />
          <AvatarFallback>
            <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">{conversationName}</h3>
            <span className="text-xs text-gray-500 ml-auto">
              {formatDate(
                lastMessage?._creationTime || conversation._creationTime
              )}
            </span>
          </div>
          <p className="text-[12px] mt-1 text-gray-500 flex items-center gap-1 ">
            {lastMessage?.sender === me?._id ? <MessageSeenSvg /> : ''}
            {conversation.isGroup && <Users size={16} />}
            {!lastMessage && 'Say Hi!'}
            {lastMessageType === 'text' ? (
              lastMessage?.content.length > 30 ? (
                <span>{lastMessage?.content.slice(0, 30)}...</span>
              ) : (
                <span>{lastMessage?.content}</span>
              )
            ) : null}
            {lastMessageType === 'image' && <ImageIcon size={16} />}
            {lastMessageType === 'video' && <VideoIcon size={16} />}
          </p>
        </div>
      </div>
      <hr className="h-[1px] mx-10 bg-gray-primary" />
    </>
  );
};
export default Conversation;
