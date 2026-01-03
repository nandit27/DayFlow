import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, DollarSign, Loader2, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        pendingLeaves: 0
    });

    const isAdmin = user?.role === 'HR' || user?.role === 'Admin';

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchDashboardStats();
    }, [isAdmin, navigate]);

    const fetchDashboardStats = async () => {
        setIsLoading(true);
        try {
            const [profilesRes, attendanceRes, leavesRes] = await Promise.all([
                axios.get(`${API_URL}/profile`),
                axios.get(`${API_URL}/attendance/all`),
                axios.get(`${API_URL}/leaves`).catch(() => ({ data: { data: [] } })) // Graceful fallback
            ]);

            const employees = profilesRes.data.data || [];
            const attendances = attendanceRes.data.data || [];
            const leaves = leavesRes.data.data || [];

            const today = new Date().toISOString().split('T')[0];
            const todayAttendances = attendances.filter(att => 
                att.date?.startsWith(today)
            );

            setStats({
                totalEmployees: employees.length,
                presentToday: todayAttendances.filter(att => att.status === 'Present').length,
                onLeave: todayAttendances.filter(att => att.status === 'On Leave').length,
                pendingLeaves: leaves.filter(leave => leave.status === 'Pending').length
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Manage Employees',
            description: 'View and manage employee records',
            icon: Users,
            color: 'blue',
            onClick: () => navigate('/employees')
        },
        {
            title: 'Attendance Records',
            description: 'Track and manage attendance',
            icon: Calendar,
            color: 'green',
            onClick: () => navigate('/attendance')
        },
        {
            title: 'Leave Requests',
            description: 'Review pending leave applications',
            icon: FileText,
            color: 'orange',
            onClick: () => navigate('/leaves')
        },
        {
            title: 'Payroll Management',
            description: 'Process and manage payroll',
            icon: DollarSign,
            color: 'purple',
            onClick: () => navigate('/payroll')
        }
    ];

    const statCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            icon: Users,
            color: 'blue',
            trend: null
        },
        {
            title: 'Present Today',
            value: stats.presentToday,
            icon: CheckCircle2,
            color: 'green',
            trend: null
        },
        {
            title: 'On Leave',
            value: stats.onLeave,
            icon: Clock,
            color: 'orange',
            trend: null
        },
        {
            title: 'Pending Requests',
            value: stats.pendingLeaves,
            icon: FileText,
            color: 'red',
            trend: null
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            green: 'bg-green-50 text-green-600 border-green-100',
            orange: 'bg-orange-50 text-orange-600 border-orange-100',
            purple: 'bg-purple-50 text-purple-600 border-purple-100',
            red: 'bg-red-50 text-red-600 border-red-100'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab="Dashboard" />

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, index) => (
                                <div 
                                    key={index}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        </div>
                                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-gray-300 transition-all group"
                                    >
                                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(action.color)} group-hover:scale-110 transition-transform`}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Placeholder */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                            <div className="text-center py-12 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Activity tracking will be displayed here</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
