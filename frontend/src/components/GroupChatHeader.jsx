import { X, Users, Settings } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import GroupSettingsModal from "./GroupSettingsModal";

const GroupChatHeader = () => {
  const { selectedGroup, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showSettings, setShowSettings] = useState(false);

  const onlineMembers = selectedGroup?.members?.filter(member => 
    onlineUsers.includes(member._id)
  ) || [];

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Group Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative bg-primary/10 flex items-center justify-center">
                {selectedGroup.avatar ? (
                  <img src={selectedGroup.avatar} alt={selectedGroup.name} />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>

            {/* Group info */}
            <div>
              <h3 className="font-medium">{selectedGroup.name}</h3>
              <p className="text-sm text-base-content/70">
                {selectedGroup.members?.length} members • {onlineMembers.length} online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings button */}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-base-200 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Close button */}
            <button onClick={() => setSelectedGroup(null)}>
              <X />
            </button>
          </div>
        </div>
      </div>

      {/* Group Settings Modal */}
      {showSettings && (
        <GroupSettingsModal 
          group={selectedGroup}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default GroupChatHeader;