import { useState } from 'react';
import { X, Loader2, XCircle } from 'lucide-react';
import { useLeaveStore } from '@/store/leaveStore';

export default function RejectLeaveModal({ leaveId, onClose, onSuccess }) {
    const { rejectLeave, isRejecting } = useLeaveStore();
    const [rejectionReason, setRejectionReason] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        const result = await rejectLeave(leaveId, rejectionReason);
        if (result.success) {
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                {/* Header */}
                <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Reject Leave Request</h2>
                            <p className="text-sm text-gray-600">Provide a reason for rejection</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={5}
                            required
                            placeholder="Explain why this leave request is being rejected..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            The employee will see this reason
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800">
                            <strong>Warning:</strong> This action cannot be undone. The employee will be notified of the rejection.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isRejecting}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isRejecting || !rejectionReason.trim()}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {isRejecting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5" />
                                    Reject Leave
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
