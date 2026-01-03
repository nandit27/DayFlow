import { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import { useLeaveStore } from '@/store/leaveStore';

export default function ApplyLeaveModal({ onClose, onSuccess }) {
    const { applyLeave, isSubmitting } = useLeaveStore();
    const [formData, setFormData] = useState({
        leaveType: 'SICK',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const leaveTypes = [
        { value: 'SICK', label: 'Sick Leave' },
        { value: 'CASUAL', label: 'Casual Leave' },
        { value: 'PAID', label: 'Paid Leave' },
        { value: 'UNPAID', label: 'Unpaid Leave' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.startDate || !formData.endDate) {
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alert('End date cannot be before start date');
            return;
        }

        const result = await applyLeave(formData);
        if (result.success) {
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
                            <p className="text-sm text-gray-600">Submit your time-off request</p>
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
                    {/* Leave Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Leave Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {leaveTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Provide a reason for your leave request..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your leave request will be sent to HR for approval. 
                            You will be notified once it's reviewed.
                        </p>
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
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
