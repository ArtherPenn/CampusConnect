import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    selectedUser,
    getDirectMessages,
    messages,
    isMessagesLoading,
    subscribeToDirectMessages,
    unsubscribeFromDirectMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageScrollEnd = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getDirectMessages(selectedUser._id);
    }
    subscribeToDirectMessages();

    return () => unsubscribeFromDirectMessages();
  }, [
    selectedUser._id,
    getDirectMessages,
    subscribeToDirectMessages,
    unsubscribeFromDirectMessages,
  ]);

  useEffect(() => {
    if (messageScrollEnd.current && messages)
      messageScrollEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          // Determine sender ID - handle both object and string formats
          const messageSenderId = typeof message.senderId === 'object' 
            ? message.senderId._id || message.senderId 
            : message.senderId;
          
          const isMyMessage = messageSenderId === authUser._id;
          
          <div
            key={message._id || idx}
                isMyMessage ? "chat-end" : "chat-start"
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageScrollEnd}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                      isMyMessage
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
