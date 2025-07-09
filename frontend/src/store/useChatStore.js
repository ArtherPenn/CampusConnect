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
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/message/users");
      set({ allUsers: response.data });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
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
      set({ messages: [...messages, response.data] });
    } catch (error) {
      toast.error("Failed to send message.");
      console.error(
        "Error sending message:",
        error.response?.data?.message || error.message
      );
    }
  },

  sendGroupMessage: async (messageData) => {
    const { groupMessages, selectedGroup } = get();

    try {
      const response = await axiosInstance.post(
        `/message/send/group/${selectedGroup._id}`,
        messageData
      );
      set({ groupMessages: [...groupMessages, response.data] });
    } catch (error) {
      toast.error("Failed to send group message.");
      console.error(
        "Error sending group message:",
        error.response?.data?.message || error.message
      );
    }
  },

  subscribeToDirectMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("directMessage", (newMessage) => {
      //Is message sent from selected user ?
      if (!(newMessage.senderId === selectedUser._id)) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;

    socket.on("groupMessage", (newMessage) => {
      // Check if message is for the selected group
      if (newMessage.groupId !== selectedGroup._id) return;

      set({
        groupMessages: [...get().groupMessages, newMessage],
      });
    });

    socket.on("newGroup", (newGroup) => {
      set({
        groups: [...get().groups, newGroup],
      });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      set({
        groups: get().groups.map(group => 
          group._id === updatedGroup._id ? updatedGroup : group
        ),
      });
    });
  },

  unsubscribeFromDirectMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("directMessage");
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("groupMessage");
    socket.off("newGroup");
    socket.off("groupUpdated");
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
      set({ users: response.data[0].contacts});
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
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
        groups: get().groups.map(group => 
          group._id === groupId ? response.data : group
        ),
        selectedGroup: get().selectedGroup?._id === groupId ? response.data : get().selectedGroup,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  },

  addMemberToGroup: async (groupId, memberIds) => {
    try {
      const response = await axiosInstance.put(`/group/${groupId}/add-member`, { memberIds });
      set({
        groups: get().groups.map(group => 
          group._id === groupId ? response.data : group
        ),
        selectedGroup: get().selectedGroup?._id === groupId ? response.data : get().selectedGroup,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding member to group:", error);
      throw error;
    }
  },

  removeMemberFromGroup: async (groupId, memberId) => {
    try {
      const response = await axiosInstance.delete(`/group/${groupId}/remove-member/${memberId}`);
      set({
        groups: get().groups.map(group => 
          group._id === groupId ? response.data : group
        ),
        selectedGroup: get().selectedGroup?._id === groupId ? response.data : get().selectedGroup,
      });
      return response.data;
    } catch (error) {
      console.error("Error removing member from group:", error);
      throw error;
    }
  },
}));