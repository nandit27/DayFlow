import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const API_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:3000/api/leaves" 
    : "/api/leaves";

export const useLeaveStore = create((set, get) => ({
    myLeaves: [],
    allLeaves: [],
    isLoading: false,
    isSubmitting: false,
    isApproving: false,
    isRejecting: false,

    // Employee: Fetch my leave requests
    fetchMyLeaves: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/my`);
            set({ 
                myLeaves: response.data.data || [],
                isLoading: false 
            });
            return { success: true };
        } catch (error) {
            console.error('Error fetching my leaves:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch leave requests');
            set({ isLoading: false });
            return { success: false };
        }
    },

    // Employee: Apply for leave
    applyLeave: async (leaveData) => {
        set({ isSubmitting: true });
        try {
            const response = await axios.post(API_URL, leaveData);
            const newLeave = response.data.data;
            
            set((state) => ({
                myLeaves: [newLeave, ...state.myLeaves],
                isSubmitting: false
            }));
            
            toast.success('Leave request submitted successfully');
            return { success: true, data: newLeave };
        } catch (error) {
            console.error('Error applying for leave:', error);
            toast.error(error.response?.data?.message || 'Failed to submit leave request');
            set({ isSubmitting: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    // HR: Fetch all leave requests
    fetchAllLeaves: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(API_URL);
            set({ 
                allLeaves: response.data.data || [],
                isLoading: false 
            });
            return { success: true };
        } catch (error) {
            console.error('Error fetching all leaves:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch leave requests');
            set({ isLoading: false });
            return { success: false };
        }
    },

    // HR: Approve leave request
    approveLeave: async (leaveId) => {
        set({ isApproving: true });
        try {
            const response = await axios.put(`${API_URL}/${leaveId}/approve`);
            const updatedLeave = response.data.data;
            
            set((state) => ({
                allLeaves: state.allLeaves.map(leave => 
                    leave._id === leaveId ? updatedLeave : leave
                ),
                myLeaves: state.myLeaves.map(leave => 
                    leave._id === leaveId ? updatedLeave : leave
                ),
                isApproving: false
            }));
            
            toast.success('Leave request approved');
            return { success: true, data: updatedLeave };
        } catch (error) {
            console.error('Error approving leave:', error);
            toast.error(error.response?.data?.message || 'Failed to approve leave');
            set({ isApproving: false });
            return { success: false };
        }
    },

    // HR: Reject leave request
    rejectLeave: async (leaveId, reason) => {
        set({ isRejecting: true });
        try {
            const response = await axios.put(`${API_URL}/${leaveId}/reject`, { reviewerComment: reason });
            const updatedLeave = response.data.data;
            
            set((state) => ({
                allLeaves: state.allLeaves.map(leave => 
                    leave._id === leaveId ? updatedLeave : leave
                ),
                myLeaves: state.myLeaves.map(leave => 
                    leave._id === leaveId ? updatedLeave : leave
                ),
                isRejecting: false
            }));
            
            toast.success('Leave request rejected');
            return { success: true, data: updatedLeave };
        } catch (error) {
            console.error('Error rejecting leave:', error);
            toast.error(error.response?.data?.message || 'Failed to reject leave');
            set({ isRejecting: false });
            return { success: false };
        }
    },

    // Helper: Get leave statistics
    getLeaveStats: () => {
        const { myLeaves } = get();
        return {
            total: myLeaves.length,
            pending: myLeaves.filter(l => l.status === 'PENDING' || l.status === 'Pending').length,
            approved: myLeaves.filter(l => l.status === 'APPROVED' || l.status === 'Approved').length,
            rejected: myLeaves.filter(l => l.status === 'REJECTED' || l.status === 'Rejected').length,
        };
    },
}));
