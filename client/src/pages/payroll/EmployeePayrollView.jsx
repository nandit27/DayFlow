import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Loader2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { usePayrollStore } from '@/store/payrollStore';

export default function EmployeePayrollView() {
    const { myPayroll, isLoading, fetchMyPayroll, formatCurrency } = usePayrollStore();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        const filters = {};
        if (selectedYear) filters.year = selectedYear;
        if (selectedMonth) filters.month = selectedMonth;
        fetchMyPayroll(filters);
    }, [selectedYear, selectedMonth, fetchMyPayroll]);

    // Generate year options (current year and 2 years back)
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

    const downloadPayslip = (payroll) => {
        // Simple text-based payslip download
        const content = `
PAYSLIP - ${formatMonthYear(payroll.month)}
=====================================

Basic Salary:     ${formatCurrency(payroll.salary.basic)}
HRA:              ${formatCurrency(payroll.salary.hra || 0)}
Allowances:       ${formatCurrency(payroll.salary.allowances || 0)}
-------------------------------------
Gross Salary:     ${formatCurrency(payroll.grossSalary)}

Deductions:       ${formatCurrency(payroll.salary.deductions || 0)}
-------------------------------------
Net Salary:       ${formatCurrency(payroll.netSalary)}

${payroll.remarks ? `Remarks: ${payroll.remarks}` : ''}

Generated on: ${format(new Date(payroll.generatedAt), 'dd MMM yyyy')}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${payroll.month}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
                    <p className="text-gray-600 mt-1">View your salary records and download payslips</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
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
                    <div className="flex-1">
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

            {/* Payroll Records */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Salary Records</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : myPayroll.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Records</h3>
                        <p className="text-gray-600">
                            {selectedMonth 
                                ? `No payroll records found for ${formatMonthYear(selectedMonth)}.`
                                : `No payroll records found for ${selectedYear}.`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {myPayroll.map((payroll) => (
                            <div key={payroll._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {formatMonthYear(payroll.month)}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Generated on {format(new Date(payroll.generatedAt), 'dd MMM yyyy')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Salary Breakdown */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Basic Salary</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(payroll.salary.basic)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">HRA</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(payroll.salary.hra || 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Allowances</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(payroll.salary.allowances || 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Deductions</p>
                                                <p className="text-sm font-medium text-red-600">
                                                    -{formatCurrency(payroll.salary.deductions || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Gross Salary</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(payroll.grossSalary)}
                                                </p>
                                            </div>
                                            <div className="h-8 w-px bg-gray-300" />
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                                                <p className="text-xl font-bold text-green-600">
                                                    {formatCurrency(payroll.netSalary)}
                                                </p>
                                            </div>
                                        </div>

                                        {payroll.remarks && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-xs font-medium text-blue-700 mb-1">Remarks</p>
                                                <p className="text-sm text-blue-600">{payroll.remarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => downloadPayslip(payroll)}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
