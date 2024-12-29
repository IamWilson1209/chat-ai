/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageSeenSvg } from '@/lib/svgs';
import { IMessage, useConversationStore } from '@/store/chat-store';
import ChatBubbleAvatar from './chat-bubble-avatar';
import DateIndicator from './date-indicator';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription } from '../ui/dialog';
import ReactPlayer from 'react-player';
import ChatAvatarActions from './chat-avatar-actions';
import { Bot } from 'lucide-react';

/* 
Passing previous message to check the date time, 
so it can build timestamp functionality 
*/
type ChatBubbleProps = {
  message: IMessage;
  me: any;
  previousMessage?: IMessage;
};

const ChatBubble = ({ me, message, previousMessage }: ChatBubbleProps) => {
  const date = new Date(message._creationTime);
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const time = `${hour}:${minute}`;

  const { selectedConversation } = useConversationStore();
  const isMember =
    selectedConversation?.participants.includes(message.sender?._id) || false;
  const isGroup = selectedConversation?.isGroup;
  const fromMe = message.sender?._id === me._id;
  const fromAI = message.sender?.name === 'ChatGPT';
  const bgClass = fromMe
    ? 'bg-green-chat'
    : !fromAI
      ? 'bg-white dark:bg-gray-primary'
      : 'bg-blue-500 text-white';

  console.log(message.sender);
  const [open, setOpen] = useState(false);

  /* text, image, video redering methods */
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return <TextMessage message={message} />;
      case 'image':
        return (
          <ImageMessage message={message} handleClick={() => setOpen(true)} />
        );
      case 'video':
        return <VideoMessage message={message} />;
      default:
        return null;
    }
  };

  /* Message is not send from authUser: */
  if (!fromMe) {
    return (
      <>
        {/* Use DateIndicator to render the timestamp of messages */}
        <DateIndicator message={message} previousMessage={previousMessage} />
        <div className="flex gap-1 w-2/3">
          <ChatBubbleAvatar
            isGroup={isGroup}
            isMember={isMember}
            message={message}
            fromAI={fromAI}
          />
          <div
            className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}
          >
            {/* 
              left-top corner will have a simple indicator if 
              message is from other or openai
            */}
            {!fromAI && <OtherMessageIndicator />}
            {fromAI && (
              <Bot size={16} className="absolute bottom-[2px] left-2" />
            )}
            {<ChatAvatarActions message={message} me={me} />}
            {/* This is where message truely show in the chat-bubble */}
            {renderMessageContent()}
            {/* if an image is opened by user, open image dialog */}
            {open && (
              <ImageDialog
                src={message.content}
                open={open}
                onClose={() => setOpen(false)}
              />
            )}
            <MessageTime time={time} fromMe={fromMe} />
          </div>
        </div>
      </>
    );
  }
  /* Message is send from authUser: */
  return (
    <>
      {/* Use DateIndicator to render the timestamp of messages */}
      <DateIndicator message={message} previousMessage={previousMessage} />
      <div className="flex gap-1 w-2/3 ml-auto">
        <div
          className={`flex  z-20 max-w-fit px-2 pt-1 rounded-md shadow-md ml-auto relative ${bgClass}`}
        >
          {/* Set the self indicator if the mwssage is send by authUser */}
          <SelfMessageIndicator />
          {/* This is where message truely show in the chat-bubble */}
          {renderMessageContent()}
          {/* if an image is opened by user, open image dialog */}
          {open && (
            <ImageDialog
              src={message.content}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
          <MessageTime time={time} fromMe={fromMe} />
        </div>
      </div>
    </>
  );
};
export default ChatBubble;

const VideoMessage = ({ message }: { message: IMessage }) => {
  return (
    <ReactPlayer
      url={message.content}
      width="250px"
      height="250px"
      controls={true}
      light={true}
    />
  );
};

const ImageMessage = ({
  message,
  handleClick,
}: {
  message: IMessage;
  handleClick: () => void;
}) => {
  return (
    <div className="w-[250px] h-[250px] m-2 relative">
      <Image
        src={message.content}
        fill
        className="cursor-pointer object-cover rounded"
        alt="image"
        onClick={handleClick}
      />
    </div>
  );
};

const ImageDialog = ({
  src,
  onClose,
  open,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="min-w-[750px]">
        <DialogDescription className="relative h-[450px] flex justify-center">
          <Image
            src={src}
            fill
            className="rounded-lg object-contain"
            alt="image"
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

/* If message seen, use indicator to tell the user */
const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => {
  return (
    <p className="text-[10px] mt-2 self-end flex gap-1 items-center">
      {time} {fromMe && <MessageSeenSvg />}
    </p>
  );
};

const OtherMessageIndicator = () => (
  <div className="absolute bg-white dark:bg-gray-primary top-0 -left-[4px] w-3 h-3 rounded-bl-full" />
);

const SelfMessageIndicator = () => (
  <div className="absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden" />
);

/* Check the link for the message and highlight it */
const TextMessage = ({ message }: { message: IMessage }) => {
  const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

  return (
    <div>
      {isLink ? (
        <a
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className={`mr-2 text-sm font-light text-blue-400 underline`}
        >
          {message.content}
        </a>
      ) : (
        <p className={`mr-2 text-sm font-light`}>{message.content}</p>
      )}
    </div>
  );
};
