import { useState } from 'react';
import AdminAttendanceView from './AdminAttendanceView';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import { cn } from "@/lib/utils";
import { useAuthStore } from '@/store/authStore';

export default function AttendanceModule() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('attendance');
    
    // Determine view based on user role
    const isAdmin = user?.role === 'HR' || user?.role === 'Admin';

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 transition-colors">

            {/* Top Application Bar - FINAL DESIGN */}
            <div className="bg-white px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-50">

                {/* Left: Navigation Tabs */}
                <div className="flex items-center gap-6">
                    <div className="font-bold text-xl tracking-tight mr-4">HR Portal</div>
                    <nav className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
                        {['Employees', 'Attendance', 'Time Off'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    activeTab === tab.toLowerCase()
                                        ? "bg-white text-black shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right: Role Indicator */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-neutral-100 rounded-lg">
                        <div className={cn(
                            "h-2 w-2 rounded-full",
                            isAdmin ? "bg-purple-500" : "bg-blue-500"
                        )} />
                        <span className="text-sm font-medium text-neutral-700">
                            {isAdmin ? 'Admin View' : 'Employee View'}
                        </span>
                    </div>
                    <div className="text-sm text-neutral-600">
                        {user?.name}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto p-6">
                {activeTab === 'attendance' ? (
                    <div className="animate-in fade-in duration-300">
                        {isAdmin ? (
                            <AdminAttendanceView />
                        ) : (
                            <EmployeeAttendanceView />
                        )}
                    </div>
                ) : (
                    /* Placeholder for other tabs */
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center border">
                            <span className="text-3xl">🚧</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                            <p className="text-neutral-500 max-w-md mx-auto mt-2">
                                This module is currently under development. <br />
                                Switch back to <strong>Attendance</strong> to view functionality.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
