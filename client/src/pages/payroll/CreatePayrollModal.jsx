import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, Users } from 'lucide-react';
import { usePayrollStore } from '@/store/payrollStore';
import axios from 'axios';

export default function CreatePayrollModal({ onClose, onSuccess }) {
    const { createPayroll, isSubmitting, calculateTotals } = usePayrollStore();
    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [formData, setFormData] = useState({
        userId: '',
        month: '',
        year: new Date().getFullYear(),
        salary: {
            basic: 0,
            hra: 0,
            allowances: 0,
            deductions: 0
        },
        remarks: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/profile', {
                withCredentials: true
            });
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.userId) {
            alert('Please select an employee');
            return;
        }

        if (!formData.month) {
            alert('Please select a month');
            return;
        }

        if (formData.salary.basic <= 0) {
            alert('Basic salary must be greater than 0');
            return;
        }

        const result = await createPayroll(formData);
        if (result.success) {
            onSuccess();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('salary.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                salary: {
                    ...formData.salary,
                    [field]: parseFloat(value) || 0
                }
            });
        } else if (name === 'year') {
            setFormData({
                ...formData,
                [name]: parseInt(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Generate month options for current year
    const generateMonthOptions = () => {
        const months = [];
        for (let i = 1; i <= 12; i++) {
            const monthValue = `${formData.year}-${i.toString().padStart(2, '0')}`;
            const monthName = new Date(formData.year, i - 1).toLocaleString('default', { month: 'long' });
            months.push({ value: monthValue, label: monthName });
        }
        return months;
    };

    // Generate year options
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

    const totals = calculateTotals(formData.salary);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Create Payroll Record</h2>
                            <p className="text-sm text-gray-600">Generate salary record for an employee</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Employee Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee <span className="text-red-500">*</span>
                        </label>
                        {isLoadingEmployees ? (
                            <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500">Loading employees...</span>
                            </div>
                        ) : (
                            <select
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select an employee</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.name} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Period Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Select month</option>
                                {generateMonthOptions().map(month => (
                                    <option key={month.value} value={month.value}>{month.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Salary Components */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Salary Breakdown</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Basic Salary <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="salary.basic"
                                    value={formData.salary.basic}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    HRA (House Rent Allowance)
                                </label>
                                <input
                                    type="number"
                                    name="salary.hra"
                                    value={formData.salary.hra}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Allowances
                                </label>
                                <input
                                    type="number"
                                    name="salary.allowances"
                                    value={formData.salary.allowances}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deductions
                                </label>
                                <input
                                    type="number"
                                    name="salary.deductions"
                                    value={formData.salary.deductions}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calculated Totals */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Gross Salary:</span>
                            <span className="text-lg font-bold text-gray-900">
                                ₹{totals.gross.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Net Salary:</span>
                            <span className="text-xl font-bold text-green-600">
                                ₹{totals.net.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Remarks (Optional)
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Add any additional notes or comments..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <DollarSign className="h-5 w-5" />
                                    Create Payroll
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
