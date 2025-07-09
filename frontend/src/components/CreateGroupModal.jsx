import { useState } from "react";
import { X, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose }) => {
  const { allUsers, createGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsCreating(true);
    try {
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberIds: selectedMembers
      });
      toast.success("Group created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold">Create New Group</h2>
          <button onClick={onClose} className="p-1 hover:bg-base-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="p-4 space-y-4">
          {/* Group Icon */}
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="label">
              <span className="label-text">Group Name *</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter group name"
              required
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="label">
              <span className="label-text">Description (Optional)</span>
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Enter group description"
              rows="3"
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="label">
              <span className="label-text">
                Select Members ({selectedMembers.length} selected)
              </span>
            </label>
            <div className="border border-base-300 rounded-lg max-h-48 overflow-y-auto">
              {allUsers.length === 0 ? (
                <div className="p-4 text-center text-base-content/60">
                  No users available
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {allUsers.map(user => (
                    <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user._id)}
                        onChange={() => handleMemberToggle(user._id)}
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <img 
                        src={user.profilePicture || "/avatar.png"} 
                        alt={user.name}
                        className="size-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-base-content/60">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
              className="btn btn-primary flex-1"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;