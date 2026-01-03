import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/attendance"
    : "/api/attendance";

axios.defaults.withCredentials = true;

export const useAttendanceStore = create((set, get) => ({
  // State
  myAttendance: [],
  todayAttendance: null,
  allAttendance: [], // Admin: All employees' attendance
  isLoading: false,
  isCheckingIn: false,
  isCheckingOut: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 30,
    pages: 0,
  },

  // Check In
  checkIn: async () => {
    set({ isCheckingIn: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/check-in`);

      set({
        todayAttendance: response.data.data,
        isCheckingIn: false,
      });

      toast.success(response.data.message || "Checked in successfully!");
      
      // Refresh attendance list
      get().fetchMyAttendance();

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to check in";

      set({
        error: message,
        isCheckingIn: false,
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Check Out
  checkOut: async () => {
    set({ isCheckingOut: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/check-out`);

      set({
        todayAttendance: response.data.data,
        isCheckingOut: false,
      });

      toast.success(response.data.message || "Checked out successfully!");
      
      // Refresh attendance list
      get().fetchMyAttendance();

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to check out";

      set({
        error: message,
        isCheckingOut: false,
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Fetch My Attendance
  fetchMyAttendance: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axios.get(`${API_URL}/my?${params.toString()}`);

      console.log('📡 fetchMyAttendance response:', response.data);

      set({
        myAttendance: response.data.data,
        pagination: response.data.pagination || get().pagination,
        isLoading: false,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch attendance";

      set({
        error: message,
        isLoading: false,
        myAttendance: [],
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Get Today's Attendance Status
  getTodayStatus: () => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = get().myAttendance.find(
      (record) => record.date.split("T")[0] === today
    );
    console.log('🔍 getTodayStatus Debug:', {
      today,
      myAttendance: get().myAttendance,
      todayRecord,
      checkIn: todayRecord?.checkIn,
      checkOut: todayRecord?.checkOut
    });
    return todayRecord || null;
  },

  // Calculate Monthly Stats
  getMonthlyStats: () => {
    const records = get().myAttendance;
    const stats = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      total: records.length,
    };

    records.forEach((record) => {
      switch (record.status) {
        case "PRESENT":
          stats.present++;
          break;
        case "ABSENT":
          stats.absent++;
          break;
        case "HALF_DAY":
          stats.halfDay++;
          break;
        case "LEAVE":
          stats.leave++;
          break;
      }
    });

    return stats;
  },

  // ADMIN ACTIONS

  // Fetch All Attendance (Admin only)
  fetchAllAttendance: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axios.get(`${API_URL}?${params.toString()}`);

      set({
        allAttendance: response.data.data,
        pagination: response.data.pagination || get().pagination,
        isLoading: false,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch attendance records";

      set({
        error: message,
        isLoading: false,
        allAttendance: [],
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Fetch Single Employee's Attendance (Admin only)
  fetchEmployeeAttendance: async (userId, filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axios.get(`${API_URL}/${userId}?${params.toString()}`);

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch employee attendance";

      set({
        error: message,
        isLoading: false,
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Mark Attendance (Admin only)
  markAttendance: async (userId, attendanceData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/mark`, {
        userId,
        ...attendanceData,
      });

      toast.success(response.data.message || "Attendance marked successfully!");
      
      // Refresh all attendance list
      get().fetchAllAttendance();

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to mark attendance";

      set({
        error: message,
        isLoading: false,
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Update Attendance (Admin only)
  updateAttendance: async (attendanceId, updates) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.put(`${API_URL}/${attendanceId}`, updates);

      toast.success(response.data.message || "Attendance updated successfully!");
      
      // Refresh all attendance list
      get().fetchAllAttendance();

      return { success: true, data: response.data.data };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update attendance";

      set({
        error: message,
        isLoading: false,
      });

      toast.error(message);
      return { success: false, message };
    }
  },

  // Delete Attendance (Admin only)
  deleteAttendance: async (attendanceId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.delete(`${API_URL}/${attendanceId}`);

      toast.success(response.data.message || "Attendance deleted successfully!");
      
      // Refresh all attendance list
      get().fetchAllAttendance();

      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete attendance";

      set({
        error: message,
        isLoading: false,
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
      myAttendance: [],
      allAttendance: [],
      todayAttendance: null,
      isLoading: false,
      isCheckingIn: false,
      isCheckingOut: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 30,
        pages: 0,
      },
    }),
}));
