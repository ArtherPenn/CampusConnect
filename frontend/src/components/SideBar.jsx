// import { useEffect } from "react";
// import { useChatStore } from "../store/useChatStore";
// import SidebarSkeleton from "./skeletons/SidebarSkeleton";
// import { Users } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";

// const SideBar = () => {
//   const { getUsers, users, isUsersLoading, selectedUser, setSelectedUser } =
//     useChatStore();
//   const { onlineUsers } = useAuthStore();

//   useEffect(() => {
//     getUsers();
//   }, [getUsers]);

//   if (isUsersLoading) return <SidebarSkeleton />;

//   return (
//     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//       <div className="border-b border-base-300 w-full p-5">
//         <div className="flex items-center gap-2">
//           <Users className="size-6" />
//           <span className="font-medium hidden lg:block">Contacts</span>
//         </div>

//         {/* TODO: Online filter toggle */}
//       </div>
//       <div className="overflow-y-auto w-full py-3">
//         {users.map((user) => (
//           <button
//             key={user._id}
//             onClick={() => setSelectedUser(user)}
//             className={`
//               w-full p-3 flex items-center gap-3
//               hover:bg-base-300 transition-colors
//               ${
//                 selectedUser?._id === user._id
//                   ? "bg-base-300 ring-1 ring-base-300"
//                   : ""
//               }
//             `}
//           >
//             <div className="relative mx-auto lg:mx-0">
//               <img
//                 src={user.profilePic || "/avatar.png"}
//                 alt={user.name}
//                 className="size-12 object-cover rounded-full"
//               />
//               {onlineUsers.includes(user._id) && (
//                 <span
//                   className="absolute bottom-0 right-0 size-3 bg-green-500
//                   rounded-full ring-2 ring-zinc-900"
//                 />
//               )}
//             </div>

//             {/* User info - only visible on larger screens */}
//             <div className="hidden lg:block text-left min-w-0">
//               <div className="font-medium truncate">{user.name}</div>
//               <div className="text-sm text-zinc-400">
//                 {onlineUsers.includes(user._id) ? "Online" : "Offline"}
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>
//     </aside>
//   );
// };

// export default SideBar;

import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X, Plus, MessageCircle, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import CreateGroupModal from "./CreateGroupModal";

const SideBar = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts"); // "contacts" or "groups"
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const {
    getUsers,
    users,
    groups,
    getGroups,
    isUsersLoading,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    getAddedUsers,
    allUsers,
    addUsersToContacts,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    getAddedUsers();
    getUsers();
    getGroups();
  }, [getAddedUsers, getUsers, getGroups]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleAddUser = async (userId) => {
    setIsAdding(true);

    try {
      await addUsersToContacts(userId);

      // For re-loading !
      await getAddedUsers();
      await getUsers();

      handleCloseSearch();
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative">
        <div className="border-b border-base-300 w-full p-5">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-4 bg-base-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-colors ${
                activeTab === "contacts"
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              <MessageCircle className="size-4" />
              <span className="hidden lg:inline">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-colors ${
                activeTab === "groups"
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              <Users className="size-4" />
              <span className="hidden lg:inline">Groups</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Search Bar */}
            <div className="flex-1 hidden lg:block">
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center gap-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <Search className="size-4 text-base-content/60" />
                <span className="text-base-content/60 text-sm">
                  {activeTab === "contacts"
                    ? "Search users..."
                    : "Search groups..."}
                </span>
              </button>
            </div>

            {/* Mobile Search Button */}
            <div className="lg:hidden">
              <button
                onClick={handleSearchClick}
                className="p-2 rounded-lg hover:bg-base-300 transition-colors"
              >
                <Search className="size-5" />
              </button>
            </div>

            {/* Create Group Button */}
            {activeTab === "groups" && (
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 rounded-lg hover:bg-base-300 transition-colors"
                title="Create Group"
              >
                <UserPlus className="size-5" />
              </button>
            )}
          </div>

          {/* TODO: Online filter toggle */}
        </div>

        {/* Search Popup */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-base-100 z-50 flex flex-col">
            {/* Search Header */}
            <div className="border-b border-base-300 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="size-5" />
                <span className="font-medium">Search Users</span>
                <button
                  onClick={handleCloseSearch}
                  className="ml-auto p-1 hover:bg-base-300 rounded-lg transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search users..."
                className="input input-bordered w-full"
                autoFocus
              />
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  {searchQuery
                    ? "No users found"
                    : "Start typing to search users"}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.name}
                          className="size-10 object-cover rounded-full"
                        />
                        {onlineUsers.includes(user._id) && (
                          <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-sm text-base-content/60 truncate">
                          {user.email || "No email"}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddUser(user._id)}
                        className="btn btn-sm btn-primary gap-1"
                        disabled={isAdding}
                      >
                        <Plus className="size-4" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="overflow-y-auto w-full py-3">
          {activeTab === "contacts"
            ? // Direct Messages/Contacts
              users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                  }}
                  className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${
                  selectedUser?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                      />
                    )}
                  </div>

                  {/* User info - only visible on larger screens */}
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))
            : // Groups
              groups.map((group) => {
                const onlineMembers =
                  group.members?.filter((member) =>
                    onlineUsers.includes(member._id)
                  ) || [];

                return (
                  <button
                    key={group._id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedUser(null);
                    }}
                    className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${
                    selectedGroup?._id === group._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
                  >
                    <div className="relative mx-auto lg:mx-0">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {group.avatar ? (
                          <img
                            src={group.avatar}
                            alt={group.name}
                            className="size-12 object-cover rounded-full"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      {onlineMembers.length > 1 && (
                        <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                      )}
                    </div>

                    {/* Group info - only visible on larger screens */}
                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-sm text-zinc-400">
                        {group.members?.length} members • {onlineMembers.length}{" "}
                        online
                      </div>
                    </div>
                  </button>
                );
              })}
        </div>
      </aside>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </>
  );
};

export default SideBar;
