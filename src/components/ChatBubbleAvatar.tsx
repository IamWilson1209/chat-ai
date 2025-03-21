import { IMessage } from '@/app/redux/conversation/IMessage';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type ChatBubbleAvatarProps = {
  message: IMessage;
  isMember: boolean;
  isGroup: boolean | undefined;
  fromAI: boolean;
};

const ChatBubbleAvatar = ({
  isGroup,
  isMember,
  message,
  fromAI,
}: ChatBubbleAvatarProps) => {
  /* Group and ai don't need online signal */
  if (!isGroup && !fromAI) return null;

  return (
    <Avatar className="overflow-visible relative">
      {/* 
        Only when user is online && is member will have online signal,
        when user has been kicked from the group, stop showing online status
      */}
      {message.sender.isOnline && isMember && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-foreground" />
      )}
      <AvatarImage
        src={message.sender?.image}
        className="rounded-full object-cover w-8 h-8"
      />
      <AvatarFallback className="w-8 h-8 ">
        <div className="animate-pulse bg-gray-tertiary rounded-full"></div>
      </AvatarFallback>
    </Avatar>
  );
};
export default ChatBubbleAvatar;
