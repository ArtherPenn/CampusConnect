import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import GroupChatHeader from "./GroupChatHeader";
import GroupMessageInput from "./GroupMessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    getGroupMessages,
    groupMessages,
    isMessagesLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageScrollEnd = useRef(null);

  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
    }
    subscribeToGroupMessages();

    return () => unsubscribeFromGroupMessages();
  }, [
    selectedGroup?._id,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  ]);

  useEffect(() => {
    if (messageScrollEnd.current && groupMessages) {
      messageScrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <GroupMessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.map((message, idx) => (
          <div
            key={message._id || idx}
            className={`chat ${
              message.senderId._id === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageScrollEnd}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId.profilePicture || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <span className="text-sm font-medium mr-2">
                {message.senderId.name}
              </span>
              <time className="text-xs opacity-50">
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
        ))}
      </div>

      <GroupMessageInput />
    </div>
  );
};

export default GroupChatContainer;