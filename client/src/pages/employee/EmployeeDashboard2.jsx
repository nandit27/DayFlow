import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { format } from 'date-fns';

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { 
        myAttendance, 
        isLoading, 
        getTodayStatus, 
        getMonthlyStats,
        checkIn, 
        checkOut,
        isCheckingIn,
        isCheckingOut,
        fetchMyAttendance 
    } = useAttendanceStore();

    useEffect(() => {
        fetchMyAttendance();
    }, [fetchMyAttendance]);

    // Recalculate these values whenever myAttendance changes
    const todayStatus = getTodayStatus();
    const monthlyStats = getMonthlyStats();
    const isCheckedIn = !!todayStatus?.checkIn;
    const hasCheckedOut = !!todayStatus?.checkOut;

    console.log('🎯 Dashboard State:', { 
        myAttendanceLength: myAttendance.length,
        todayStatus, 
        isCheckedIn, 
        hasCheckedOut 
    });

    const handleCheckIn = async () => {
        const result = await checkIn();
        if (result.success) {
            await fetchMyAttendance();
        }
    };

    const handleCheckOut = async () => {
        const result = await checkOut();
        if (result.success) {
            await fetchMyAttendance();
        }
    };

    const quickActions = [
        {
            title: 'My Attendance',
            description: 'View attendance history',
            icon: Calendar,
            color: 'blue',
            onClick: () => navigate('/attendance')
        },
        {
            title: 'Apply for Leave',
            description: 'Request time off',
            icon: FileText,
            color: 'orange',
            onClick: () => navigate('/leaves')
        },
        {
            title: 'My Profile',
            description: 'Update personal information',
            icon: Calendar,
            color: 'purple',
            onClick: () => navigate('/employee/me')
        }
    ];

    const statCards = [
        {
            title: 'Present Days',
            value: monthlyStats.present,
            icon: CheckCircle2,
            color: 'green'
        },
        {
            title: 'Absent Days',
            value: monthlyStats.absent,
            icon: XCircle,
            color: 'red'
        },
        {
            title: 'On Leave',
            value: monthlyStats.onLeave,
            icon: AlertCircle,
            color: 'orange'
        },
        {
            title: 'Work From Home',
            value: monthlyStats.workFromHome,
            icon: Clock,
            color: 'blue'
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'text-green-600 bg-green-50';
            case 'Absent': return 'text-red-600 bg-red-50';
            case 'On Leave': return 'text-orange-600 bg-orange-50';
            case 'Work From Home': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab="Dashboard" />

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
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
                        {/* Check-In/Out Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Today's Attendance</h2>
                                    <p className="text-blue-100">
                                        {new Date().toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                    {isCheckedIn && todayStatus?.checkIn && (
                                        <p className="text-blue-100 mt-2">
                                            Checked in at {format(new Date(todayStatus.checkIn), 'hh:mm a')}
                                        </p>
                                    )}
                                    {hasCheckedOut && todayStatus?.checkOut && (
                                        <p className="text-blue-100 mt-1">
                                            Checked out at {format(new Date(todayStatus.checkOut), 'hh:mm a')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    {!isCheckedIn ? (
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={isCheckingIn}
                                            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isCheckingIn ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-5 w-5" />
                                            )}
                                            Check In
                                        </button>
                                    ) : !hasCheckedOut ? (
                                        <button
                                            onClick={handleCheckOut}
                                            disabled={isCheckingOut}
                                            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isCheckingOut ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <XCircle className="h-5 w-5" />
                                            )}
                                            Check Out
                                        </button>
                                    ) : (
                                        <div className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Day Complete
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Monthly Stats */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">This Month's Summary</h2>
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
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                        {/* Recent Attendance */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Attendance</h2>
                            {myAttendance && myAttendance.length > 0 ? (
                                <div className="space-y-3">
                                    {myAttendance.slice(0, 5).map((record, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {format(new Date(record.date), 'dd')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {format(new Date(record.date), 'MMM')}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {format(new Date(record.date), 'EEEE')}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : 'N/A'}
                                                        {record.checkOut && ` - ${format(new Date(record.checkOut), 'hh:mm a')}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No attendance records found</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
