import { useState } from 'react';
import { X, Loader2, DollarSign } from 'lucide-react';
import { usePayrollStore } from '@/store/payrollStore';
import { format } from 'date-fns';

export default function EditPayrollModal({ payroll, onClose, onSuccess }) {
    const { updatePayroll, isUpdating, calculateTotals } = usePayrollStore();
    const [formData, setFormData] = useState({
        salary: {
            basic: payroll.salary.basic,
            hra: payroll.salary.hra || 0,
            allowances: payroll.salary.allowances || 0,
            deductions: payroll.salary.deductions || 0
        },
        remarks: payroll.remarks || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.salary.basic <= 0) {
            alert('Basic salary must be greater than 0');
            return;
        }

        const result = await updatePayroll(payroll._id, formData);
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
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const formatMonthYear = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return format(date, 'MMMM yyyy');
    };

    const totals = calculateTotals(formData.salary);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Payroll Record</h2>
                            <p className="text-sm text-gray-600">
                                {payroll.user?.name} - {formatMonthYear(payroll.month)}
                            </p>
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
                    {/* Employee & Period Info (Read-only) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Employee</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {payroll.user?.name}
                                </p>
                                <p className="text-xs text-gray-500">{payroll.user?.employeeId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Period</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatMonthYear(payroll.month)}
                                </p>
                            </div>
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calculated Totals */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Gross Salary:</span>
                            <span className="text-lg font-bold text-gray-900">
                                ₹{totals.gross.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Net Salary:</span>
                            <span className="text-xl font-bold text-blue-600">
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Updating this payroll record will reflect changes in the employee's salary statement.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
