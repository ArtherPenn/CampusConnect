import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [],
  allUsers: [],
  messages: [],
  selectedUser: null,
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

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessages: async (messageData) => {
    const { messages, selectedUser } = get();

    try {
      const response = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
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

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("message", (newMessage) => {
      //Is message sent from selected user ?
      if (!(newMessage.senderId === selectedUser._id)) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("message");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

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
}));
