import Navbar from '@/components/Navbar';
import AdminAttendanceView3 from './AdminAttendanceView3';
import EmployeeAttendanceView2 from './EmployeeAttendanceView2';
import { useAuthStore } from '@/store/authStore';

export default function AttendanceModule() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'HR' || user?.role === 'Admin';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab="Attendance" />

            <div className="max-w-7xl mx-auto p-6">
                {isAdmin ? (
                    <AdminAttendanceView3 />
                ) : (
                    <EmployeeAttendanceView2 />
                )}
            </div>
        </div>
    );
}
