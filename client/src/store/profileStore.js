import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/profile"
    : "/api/profile";

axios.defaults.withCredentials = true;

export const useProfileStore = create((set, get) => ({
  // State
  myProfile: null,
  otherProfile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  // Fetch My Profile
  fetchMyProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/me`);

      set({
        myProfile: response.data.data,
        isLoading: false,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch profile";

      set({
        error: message,
        isLoading: false,
        myProfile: null,
      });

      // Don't show error toast on initial load if profile doesn't exist yet
      if (error?.response?.status !== 404) {
        toast.error(message);
      }

      return { success: false, message };
    }
  },

  // Fetch Other User's Profile (HR only)
  fetchUserProfile: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/${userId}`);

      set({
        otherProfile: response.data.data,
        isLoading: false,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch user profile";

      set({
        error: message,
        isLoading: false,
        otherProfile: null,
      });

      if (error?.response?.status !== 404) {
        toast.error(message);
      }

      return { success: false, message };
    }
  },

  // Update My Profile
  updateMyProfile: async (updates) => {
    set({ isUpdating: true, error: null });

    try {
      const response = await axios.put(`${API_URL}/me`, updates);

      set({
        myProfile: response.data.data,
        isUpdating: false,
      });

      toast.success(response.data.message || "Profile updated successfully!");

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update profile";

      set({
        error: message,
        isUpdating: false,
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Clear Error
  clearError: () => set({ error: null }),

  // Reset Store
  reset: () =>
    set({
      myProfile: null,
      otherProfile: null,
      isLoading: false,
      isUpdating: false,
      error: null,
    }),
}));
