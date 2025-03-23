import ChatBubble from './ChatBubble';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/stores';

const MessageContainer = () => {
  /* 使用 Redux 的 useSelector 獲取 selectedConversation */
  const selectedConversation = useSelector(
    (state: RootState) => state.conversation.selectedConversation
  );

  /* 使用 Convex 的 useQuery 獲取消息和用戶信息 */
  const messages = useQuery(api.functions.messages.getMessages, {
    conversation: selectedConversation!._id,
  });
  const me = useQuery(api.functions.users.getMe);
  /* 
    lastMessageRef 是單一的 ref 物件，current 值會被覆蓋
    最終只指向最後一個渲染的 <div>（也就是 messages 陣列中的最後一則消息）
  */
  const lastMessageRef = useRef<HTMLDivElement>(null);

  /* 自動滾動到最新消息 */
  useEffect(() => {
    setTimeout(() => {
      /* 根據最後一則消息的html.ref滾動 */
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  return (
    <div className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark bg-center">
      <div className="mx-12 flex flex-col gap-3">
        {messages?.map((msg, idx) => (
          // ref message
          <div key={msg._id} ref={lastMessageRef}>
            <ChatBubble
              message={msg}
              me={me}
              previousMessage={idx > 0 ? messages[idx - 1] : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default MessageContainer;
