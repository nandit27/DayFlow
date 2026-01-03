import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api/profile" : "/api/profile";

export default function EmployeesListPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { getTodayStatus, checkIn, checkOut, isCheckingIn, isCheckingOut, fetchMyAttendance } = useAttendanceStore();
    
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const isAdmin = user?.role === 'HR' || user?.role === 'Admin';
    const todayStatus = getTodayStatus();
    const isCheckedIn = !!todayStatus?.checkIn;
    const hasCheckedOut = !!todayStatus?.checkOut;

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                if (isAdmin) {
                    const response = await axios.get(`${API_URL}`);
                    setEmployees(response.data.data || []);
                } else {
                    const response = await axios.get(`${API_URL}/me`);
                    setEmployees(response.data.data ? [response.data.data] : []);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
                if (error?.response?.status !== 404) {
                    toast.error('Failed to load employees');
                }
                setEmployees([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchEmployees();
            fetchMyAttendance();
        }
    }, [user, isAdmin, fetchMyAttendance]);

    const handleCheckIn = async () => {
        const result = await checkIn();
        if (result.success) {
            fetchMyAttendance();
        }
    };

    const handleCheckOut = async () => {
        const result = await checkOut();
        if (result.success) {
            fetchMyAttendance();
        }
    };

    const filteredEmployees = employees.filter(emp => {
        if (!searchQuery.trim()) return true;
        const userName = emp.user?.name?.toLowerCase() || '';
        const userEmail = emp.user?.email?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return userName.includes(query) || userEmail.includes(query);
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab="Employees" />

            <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
                {/* Left: Employee Grid */}
                <div className="flex-1 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isAdmin ? 'All Employees' : 'My Profile'}
                        </h1>
                        {isAdmin && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-sm font-semibold border border-purple-200">
                                ADMIN VIEW
                            </span>
                        )}
                    </div>

                    {/* Search */}
                    {isAdmin && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    )}

                    {/* Employee Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-500">No employees found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredEmployees.map((emp, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate(`/employee/${emp.user?._id || 'me'}`)}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {emp.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600">
                                                {emp.user?.name || 'Unknown'}
                                            </h3>
                                            <p className="text-sm text-gray-600 truncate">{emp.designation || 'No designation'}</p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">{emp.user?.email}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                                                    {emp.department || 'N/A'}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                                                    {emp.user?.employeeId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Check-In/Out Panel (Employee Only) */}
                {!isAdmin && (
                    <div className="lg:w-80 space-y-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white sticky top-24">
                            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                            
                            <div className="space-y-3">
                                {!isCheckedIn ? (
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={isCheckingIn}
                                        className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCheckingIn ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Check In'
                                        )}
                                    </button>
                                ) : !hasCheckedOut ? (
                                    <button
                                        onClick={handleCheckOut}
                                        disabled={isCheckingOut}
                                        className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCheckingOut ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Check Out'
                                        )}
                                    </button>
                                ) : (
                                    <div className="w-full px-4 py-3 bg-white/20 text-white rounded-lg font-semibold text-center">
                                        Day Complete ✓
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate('/attendance')}
                                    className="w-full px-4 py-3 bg-white/10 backdrop-blur text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                >
                                    View Attendance
                                </button>
                            </div>

                            {todayStatus && (
                                <div className="mt-6 pt-6 border-t border-white/20 space-y-2 text-sm">
                                    <p className="text-blue-100">Today's Status:</p>
                                    {todayStatus.checkIn && (
                                        <p className="font-medium">
                                            In: {new Date(todayStatus.checkIn).toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    )}
                                    {todayStatus.checkOut && (
                                        <p className="font-medium">
                                            Out: {new Date(todayStatus.checkOut).toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
