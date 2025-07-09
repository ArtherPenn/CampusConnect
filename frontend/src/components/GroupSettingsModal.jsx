import { useState } from "react";
import { X, UserPlus, UserMinus, Edit3, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const GroupSettingsModal = ({ group, onClose }) => {
  const { authUser } = useAuthStore();
  const { updateGroup, addMemberToGroup, removeMemberFromGroup, allUsers } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(group.description || "");
  const [showAddMember, setShowAddMember] = useState(false);

  const isAdmin = group.admin._id === authUser._id;
  const availableUsers = allUsers.filter(user => 
    !group.members.some(member => member._id === user._id)
  );

  const handleUpdateGroup = async () => {
    try {
      await updateGroup(group._id, { name: groupName, description: groupDescription });
      setIsEditing(false);
      toast.success("Group updated successfully!");
    } catch (error) {
      toast.error("Failed to update group");
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addMemberToGroup(group._id, [userId]);
      setShowAddMember(false);
      toast.success("Member added successfully!");
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMemberFromGroup(group._id, memberId);
      toast.success("Member removed successfully!");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold">Group Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-base-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Info */}
        <div className="p-4 space-y-4">
          {/* Group Avatar */}
          <div className="flex justify-center">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              {group.avatar ? (
                <img src={group.avatar} alt={group.name} className="size-20 rounded-full" />
              ) : (
                <Users className="w-10 h-10 text-primary" />
              )}
            </div>
          </div>

          {/* Group Name and Description */}
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Group name"
              />
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Group description"
                rows="3"
              />
              <div className="flex gap-2">
                <button onClick={handleUpdateGroup} className="btn btn-primary btn-sm">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                {isAdmin && (
                  <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-base-200 rounded">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {group.description && (
                <p className="text-base-content/70">{group.description}</p>
              )}
              <p className="text-sm text-base-content/60">
                {group.members.length} members
              </p>
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="border-t border-base-300">
          <div className="flex items-center justify-between p-4">
            <h4 className="font-medium">Members</h4>
            {isAdmin && (
              <button 
                onClick={() => setShowAddMember(!showAddMember)}
                className="btn btn-sm btn-primary gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>

          {/* Add Member Section */}
          {showAddMember && (
            <div className="px-4 pb-4">
              <div className="bg-base-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <p className="text-center text-base-content/60 text-sm">
                    No users available to add
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableUsers.map(user => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={user.profilePicture || "/avatar.png"} 
                            alt={user.name}
                            className="size-6 rounded-full"
                          />
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <button 
                          onClick={() => handleAddMember(user._id)}
                          className="btn btn-xs btn-primary"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="px-4 pb-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {group.members.map(member => (
                <div key={member._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={member.profilePicture || "/avatar.png"} 
                      alt={member.name}
                      className="size-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      {member._id === group.admin._id && (
                        <p className="text-xs text-primary">Admin</p>
                      )}
                    </div>
                  </div>
                  
                  {isAdmin && member._id !== group.admin._id && (
                    <button 
                      onClick={() => handleRemoveMember(member._id)}
                      className="btn btn-xs btn-error btn-outline"
                    >
                      <UserMinus className="w-3 h-3" />
                    </button>
                  )}
                  
                  {member._id === authUser._id && member._id !== group.admin._id && (
                    <button 
                      onClick={() => handleRemoveMember(member._id)}
                      className="btn btn-xs btn-outline"
                    >
                      Leave
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;