import { useState, useEffect } from 'react';
import { Search, Loader2, Plus, Edit2, Trash2, DollarSign, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { usePayrollStore } from '@/store/payrollStore';
import CreatePayrollModal from './CreatePayrollModal';
import EditPayrollModal from './EditPayrollModal';

export default function AdminPayrollView() {
    const { 
        allPayroll, 
        payrollStats,
        isLoading, 
        isDeleting,
        fetchAllPayroll, 
        fetchPayrollStats,
        deletePayroll,
        formatCurrency 
    } = usePayrollStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    useEffect(() => {
        const filters = {};
        if (selectedYear) filters.year = selectedYear;
        if (selectedMonth) filters.month = selectedMonth;
        fetchAllPayroll(filters);
        fetchPayrollStats(selectedMonth);
    }, [selectedYear, selectedMonth, fetchAllPayroll, fetchPayrollStats]);

    const handleEdit = (payroll) => {
        setSelectedPayroll(payroll);
        setShowEditModal(true);
    };

    const handleDelete = async (payrollId) => {
        if (confirm('Are you sure you want to delete this payroll record? This action cannot be undone.')) {
            await deletePayroll(payrollId);
        }
    };

    // Generate year options
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

    // Generate month options
    const monthOptions = [
        { value: '', label: 'All Months' },
        { value: `${selectedYear}-01`, label: 'January' },
        { value: `${selectedYear}-02`, label: 'February' },
        { value: `${selectedYear}-03`, label: 'March' },
        { value: `${selectedYear}-04`, label: 'April' },
        { value: `${selectedYear}-05`, label: 'May' },
        { value: `${selectedYear}-06`, label: 'June' },
        { value: `${selectedYear}-07`, label: 'July' },
        { value: `${selectedYear}-08`, label: 'August' },
        { value: `${selectedYear}-09`, label: 'September' },
        { value: `${selectedYear}-10`, label: 'October' },
        { value: `${selectedYear}-11`, label: 'November' },
        { value: `${selectedYear}-12`, label: 'December' },
    ];

    const formatMonthYear = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return format(date, 'MMMM yyyy');
    };

    const filteredPayroll = allPayroll.filter(payroll => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const employeeName = payroll.user?.name?.toLowerCase() || '';
        const employeeId = payroll.user?.employeeId?.toLowerCase() || '';
        return employeeName.includes(query) || employeeId.includes(query);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-gray-600 mt-1">Manage employee salary records and payroll</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Create Payroll
                </button>
            </div>

            {/* Statistics Cards */}
            {payrollStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {payrollStats.totalEmployees || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(payrollStats.totalPayroll || 0)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(payrollStats.averageSalary || 0)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Records</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {payrollStats.totalRecords || 0}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Employee</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(Number(e.target.value));
                                setSelectedMonth('');
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {monthOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Payroll Records Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Payroll Records ({filteredPayroll.length})
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredPayroll.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Records</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery 
                                ? `No payroll records found matching "${searchQuery}".`
                                : 'Get started by creating the first payroll record.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Create Payroll
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Basic
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gross
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deductions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Net Salary
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayroll.map((payroll) => (
                                    <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payroll.user?.name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payroll.user?.employeeId}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatMonthYear(payroll.month)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatCurrency(payroll.salary.basic)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(payroll.grossSalary)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-red-600">
                                                {formatCurrency(payroll.salary.deductions || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-green-600">
                                                {formatCurrency(payroll.netSalary)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(payroll)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(payroll._id)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreatePayrollModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchAllPayroll({ year: selectedYear, month: selectedMonth });
                        fetchPayrollStats(selectedMonth);
                        setShowCreateModal(false);
                    }}
                />
            )}

            {showEditModal && selectedPayroll && (
                <EditPayrollModal
                    payroll={selectedPayroll}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedPayroll(null);
                    }}
                    onSuccess={() => {
                        fetchAllPayroll({ year: selectedYear, month: selectedMonth });
                        fetchPayrollStats(selectedMonth);
                        setShowEditModal(false);
                        setSelectedPayroll(null);
                    }}
                />
            )}
        </div>
    );
}
