import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [],
  allUsers: [],
  groups: [],
  messages: [],
  groupMessages: [],
  events: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Clear all chat data (useful when switching users)
  clearChatData: () => {
    set({
      users: [],
      allUsers: [],
      groups: [],
      messages: [],
      groupMessages: [],
      events: [],
      selectedUser: null,
      selectedGroup: null,
    });
  },
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/message/users");
      set({ allUsers: response.data });
    } catch (error) {
      // Only show error if it's not a 404 (no users found)
      if (error.response?.status !== 404) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      } else {
        set({ allUsers: [] });
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getDirectMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/direct/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/group/${groupId}`);
      set({ groupMessages: response.data });
    } catch (error) {
      console.error("Error fetching group messages:", error);
      toast.error("Failed to load group messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendDirectMessage: async (messageData) => {
    const { messages, selectedUser } = get();

    try {
      const response = await axiosInstance.post(
        `/message/send/direct/${selectedUser._id}`,
        messageData
      );
      // Don't add message here - let socket handle it for real-time sync
      // set({ messages: [...messages, response.data] });
    } catch (error) {
      toast.error("Failed to send message.");
      console.error(
        "Error sending message:",
        error.response?.data?.message || error.message
      );
      throw error; // Re-throw to handle in component
    }
  },

  sendGroupMessage: async (messageData) => {
    const { groupMessages, selectedGroup } = get();

    try {
      const response = await axiosInstance.post(
        `/message/send/group/${selectedGroup._id}`,
        messageData
      );
      // Don't add message here - let socket handle it for real-time sync
      // set({ groupMessages: [...groupMessages, response.data] });
    } catch (error) {
      toast.error("Failed to send group message.");
      console.error(
        "Error sending group message:",
        error.response?.data?.message || error.message
      );
      throw error; // Re-throw to handle in component
    }
  },

  subscribeToDirectMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // socket.on("directMessage", (newMessage) => {
    //   const { selectedUser } = get();
    //   const authUser = useAuthStore.getState().authUser;

    //   // Only add message if it's for the currently selected conversation
    //   if (selectedUser && (
    //     newMessage.senderId._id === selectedUser._id ||
    //     newMessage.senderId._id === authUser._id
    //   ) && (
    //     newMessage.receiverId === authUser._id ||
    //     newMessage.receiverId === selectedUser._id
    //   )) {
    //     set({
    //       messages: [...get().messages, newMessage],
    //     });
    //   }
    // });

    socket.on("directMessage", (newMessage) => {
      // Normalize senderId and receiverId to strings
      const senderId =
        typeof newMessage.senderId === "object"
          ? newMessage.senderId._id
          : newMessage.senderId;
      const receiverId =
        typeof newMessage.receiverId === "object"
          ? newMessage.receiverId._id
          : newMessage.receiverId;
      const { selectedUser } = get();
      const authUser = useAuthStore.getState().authUser;

      if (
        selectedUser &&
        (senderId === selectedUser._id || senderId === authUser._id) &&
        (receiverId === authUser._id || receiverId === selectedUser._id)
      ) {
        set({
          messages: [
            ...get().messages,
            { ...newMessage, senderId, receiverId },
          ],
        });
      }
    });
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;

    socket.on("groupMessage", (newMessage) => {
      const { selectedGroup } = get();

      // Only add message if it's for the currently selected group
      if (selectedGroup && newMessage.groupId === selectedGroup._id) {
        set({
          groupMessages: [...get().groupMessages, newMessage],
        });
      }
    });

    socket.on("newGroup", (newGroup) => {
      set({
        groups: [...get().groups, newGroup],
      });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      set({
        groups: get().groups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group
        ),
      });
    });
  },

  unsubscribeFromDirectMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
    socket.off("directMessage");
    }
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
    socket.off("groupMessage");
    socket.off("newGroup");
    socket.off("groupUpdated");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  getAddedUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;

      const response = await axiosInstance.get(
        `/chat/contacts/${authUser._id}`
      );
      // Handle case where user has no contacts yet
      if (response.data && response.data.length > 0 && response.data[0].contacts) {
        set({ users: response.data[0].contacts });
      } else {
        set({ users: [] });
      }
    } catch (error) {
      // Only show error if it's not a 404 (no contacts found)
      if (error.response?.status !== 404) {
        console.error("Error fetching added users:", error);
        toast.error("Failed to load contacts.");
      } else {
        set({ users: [] });
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  addUsersToContacts: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/chat/contacts/addUser/${userId}`
      );

      console.log(response);
    } catch (error) {
      console.error("addUsersToContacts:", error);
      toast.error("Failed addUsersToContacts.");
    }
  },

  // Group functions
  getGroups: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/group");
      set({ groups: response.data });
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const response = await axiosInstance.post("/group/create", groupData);
      set({ groups: [...get().groups, response.data] });
      return response.data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  updateGroup: async (groupId, updateData) => {
    try {
      const response = await axiosInstance.put(`/group/${groupId}`, updateData);
      set({
        groups: get().groups.map((group) =>
          group._id === groupId ? response.data : group
        ),
        selectedGroup:
          get().selectedGroup?._id === groupId
            ? response.data
            : get().selectedGroup,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  },

  addMemberToGroup: async (groupId, memberIds) => {
    try {
      const response = await axiosInstance.put(`/group/${groupId}/add-member`, {
        memberIds,
      });
      set({
        groups: get().groups.map((group) =>
          group._id === groupId ? response.data : group
        ),
        selectedGroup:
          get().selectedGroup?._id === groupId
            ? response.data
            : get().selectedGroup,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding member to group:", error);
      throw error;
    }
  },

  removeMemberFromGroup: async (groupId, memberId) => {
    try {
      const response = await axiosInstance.delete(
        `/group/${groupId}/remove-member/${memberId}`
      );
      set({
        groups: get().groups.map((group) =>
          group._id === groupId ? response.data : group
        ),
        selectedGroup:
          get().selectedGroup?._id === groupId
            ? response.data
            : get().selectedGroup,
      });
      return response.data;
    } catch (error) {
      console.error("Error removing member from group:", error);
      throw error;
    }
  },

  // Event functions
  createEvent: async (eventData) => {
    try {
      const response = await axiosInstance.post("/event/create", eventData);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  getGroupEvents: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/event/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching group events:", error);
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await axiosInstance.delete(`/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
}));
