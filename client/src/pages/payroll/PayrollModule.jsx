import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import EmployeePayrollView from './EmployeePayrollView';
import AdminPayrollView from './AdminPayrollView';

export default function PayrollModule() {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {user?.role === 'HR' || user?.role === 'Admin' ? (
                    <AdminPayrollView />
                ) : (
                    <EmployeePayrollView />
                )}
            </div>
        </div>
    );
}
