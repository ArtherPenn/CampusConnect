import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:2500";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningIn: false,
  isLoggedIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });

      get().connectSocket();
    } catch (error) {
      console.error("Error checking authentication:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signIn: async (formData) => {
    set({ isSigningIn: true });

    try {
      const currentUser = await axiosInstance.post("/auth/signIn", formData);
      set({ authUser: currentUser.data });
      toast.success("Account created successfully!");

      // Clear any existing chat data when signing in
      const { useChatStore } = await import("./useChatStore");
      useChatStore.getState().clearChatData();
      get().connectSocket();
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningIn: false });
    }
  },

  logIn: async (formData) => {
    set({ isLoggedIn: true });
    try {
      const response = await axiosInstance.post("/auth/logIn", formData);
      set({ authUser: response.data });
      toast.success("Logged in successfully!");

      // Clear any existing chat data when logging in
      const { useChatStore } = await import("./useChatStore");
      useChatStore.getState().clearChatData();
      get().connectSocket();
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggedIn: false });
    }
  },

  logOut: async () => {
    try {
      await axiosInstance.post("/auth/logOut");
      set({ authUser: null });
      toast.success("Logged out successfully!");

      // Clear chat data when logging out
      const { useChatStore } = await import("./useChatStore");
      useChatStore.getState().clearChatData();
      get().disconnectSocket();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response?.data?.message);
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
