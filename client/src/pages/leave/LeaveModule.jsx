import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import AdminLeaveView from './AdminLeaveView';
import EmployeeLeaveView from './EmployeeLeaveView';

export default function LeaveModule() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'HR' || user?.role === 'Admin';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab="Time Off" />

            <div className="max-w-7xl mx-auto p-6">
                {isAdmin ? (
                    <AdminLeaveView />
                ) : (
                    <EmployeeLeaveView />
                )}
            </div>
        </div>
    );
}
