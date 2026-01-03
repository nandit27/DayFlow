import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const API_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:3000/api/payroll" 
    : "/api/payroll";

export const usePayrollStore = create((set, get) => ({
    myPayroll: [],
    allPayroll: [],
    payrollStats: null,
    isLoading: false,
    isSubmitting: false,
    isUpdating: false,
    isDeleting: false,

    // Employee: Fetch my payroll records
    fetchMyPayroll: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const queryParams = new URLSearchParams();
            if (filters.month) queryParams.append('month', filters.month);
            if (filters.year) queryParams.append('year', filters.year);

            const response = await axios.get(`${API_URL}/my?${queryParams.toString()}`);
            set({ 
                myPayroll: response.data.data || [],
                isLoading: false 
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching my payroll:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch payroll records');
            set({ isLoading: false });
            return { success: false };
        }
    },

    // HR: Fetch all payroll records
    fetchAllPayroll: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const queryParams = new URLSearchParams();
            if (filters.month) queryParams.append('month', filters.month);
            if (filters.year) queryParams.append('year', filters.year);

            const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
            set({ 
                allPayroll: response.data.data || [],
                isLoading: false 
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching all payroll:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch payroll records');
            set({ isLoading: false });
            return { success: false };
        }
    },

    // HR: Fetch payroll statistics
    fetchPayrollStats: async (month = null) => {
        try {
            const queryParams = month ? `?month=${month}` : '';
            const response = await axios.get(`${API_URL}/stats${queryParams}`);
            set({ payrollStats: response.data.data });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching payroll stats:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch statistics');
            return { success: false };
        }
    },

    // HR: Create payroll record
    createPayroll: async (payrollData) => {
        set({ isSubmitting: true });
        try {
            const response = await axios.post(API_URL, payrollData);
            const newPayroll = response.data.data;
            
            set((state) => ({
                allPayroll: [newPayroll, ...state.allPayroll],
                isSubmitting: false
            }));
            
            toast.success('Payroll record created successfully');
            return { success: true, data: newPayroll };
        } catch (error) {
            console.error('Error creating payroll:', error);
            toast.error(error.response?.data?.message || 'Failed to create payroll record');
            set({ isSubmitting: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    // HR: Update payroll record
    updatePayroll: async (payrollId, payrollData) => {
        set({ isUpdating: true });
        try {
            const response = await axios.put(`${API_URL}/${payrollId}`, payrollData);
            const updatedPayroll = response.data.data;
            
            set((state) => ({
                allPayroll: state.allPayroll.map(payroll => 
                    payroll._id === payrollId ? updatedPayroll : payroll
                ),
                myPayroll: state.myPayroll.map(payroll => 
                    payroll._id === payrollId ? updatedPayroll : payroll
                ),
                isUpdating: false
            }));
            
            toast.success('Payroll record updated successfully');
            return { success: true, data: updatedPayroll };
        } catch (error) {
            console.error('Error updating payroll:', error);
            toast.error(error.response?.data?.message || 'Failed to update payroll record');
            set({ isUpdating: false });
            return { success: false };
        }
    },

    // HR: Delete payroll record
    deletePayroll: async (payrollId) => {
        set({ isDeleting: true });
        try {
            await axios.delete(`${API_URL}/${payrollId}`);
            
            set((state) => ({
                allPayroll: state.allPayroll.filter(payroll => payroll._id !== payrollId),
                myPayroll: state.myPayroll.filter(payroll => payroll._id !== payrollId),
                isDeleting: false
            }));
            
            toast.success('Payroll record deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('Error deleting payroll:', error);
            toast.error(error.response?.data?.message || 'Failed to delete payroll record');
            set({ isDeleting: false });
            return { success: false };
        }
    },

    // Helper: Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Helper: Calculate totals from salary breakdown
    calculateTotals: (salary) => {
        const gross = (salary.basic || 0) + (salary.hra || 0) + (salary.allowances || 0);
        const net = gross - (salary.deductions || 0);
        return { gross, net };
    },
}));
