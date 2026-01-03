import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useLeaveStore } from '@/store/leaveStore';
import ApplyLeaveModal from './ApplyLeaveModal';

export default function EmployeeLeaveView() {
    const { myLeaves, isLoading, fetchMyLeaves, getLeaveStats } = useLeaveStore();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchMyLeaves();
    }, [fetchMyLeaves]);

    const stats = getLeaveStats();

    const formatLeaveType = (type) => {
        const typeMap = {
            'SICK': 'Sick Leave',
            'CASUAL': 'Casual Leave',
            'PAID': 'Paid Leave',
            'UNPAID': 'Unpaid Leave'
        };
        return typeMap[type] || type;
    };

    const getStatusDisplay = (status) => {
        const upperStatus = status?.toUpperCase();
        switch (upperStatus) {
            case 'PENDING': return 'Pending';
            case 'APPROVED': return 'Approved';
            case 'REJECTED': return 'Rejected';
            default: return status;
        }
    };

    const filteredLeaves = filterStatus === 'All' 
        ? myLeaves 
        : myLeaves.filter(leave => 
            leave.status === filterStatus || 
            leave.status === filterStatus.toUpperCase()
        );

    const getStatusColor = (status) => {
        const upperStatus = status?.toUpperCase();
        switch (upperStatus) {
            case 'APPROVED': return 'text-green-700 bg-green-50 border-green-200';
            case 'REJECTED': return 'text-red-700 bg-red-50 border-red-200';
            case 'PENDING': return 'text-orange-700 bg-orange-50 border-orange-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        const upperStatus = status?.toUpperCase();
        switch (upperStatus) {
            case 'APPROVED': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'REJECTED': return <XCircle className="h-5 w-5 text-red-600" />;
            case 'PENDING': return <Clock className="h-5 w-5 text-orange-600" />;
            default: return null;
        }
    };

    const calculateDuration = (startDate, endDate) => {
        const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        return days === 1 ? '1 day' : `${days} days`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
                    <p className="text-gray-600 mt-1">View and manage your time-off requests</p>
                </div>
                <button
                    onClick={() => setShowApplyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Apply for Leave
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Approved</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rejected</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            filterStatus === status
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Leave Requests List */}
            <div className="bg-white rounded-xl border border-gray-200">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    </div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Requests</h3>
                        <p className="text-gray-600 mb-6">
                            {filterStatus === 'All' 
                                ? "You haven't submitted any leave requests yet."
                                : `No ${filterStatus.toLowerCase()} leave requests.`}
                        </p>
                        <button
                            onClick={() => setShowApplyModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Apply for Leave
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredLeaves.map((leave) => (
                            <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {formatLeaveType(leave.leaveType)}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(leave.status)}`}>
                                                {getStatusIcon(leave.status)}
                                                {getStatusDisplay(leave.status)}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">End Date</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {calculateDuration(leave.startDate, leave.endDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Applied On</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>

                                        {leave.reason && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500 mb-1">Reason</p>
                                                <p className="text-sm text-gray-700">{leave.reason}</p>
                                            </div>
                                        )}

                                        {leave.status === 'Rejected' && leave.rejectionReason && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                                                <p className="text-sm text-red-600">{leave.rejectionReason}</p>
                                            </div>
                                        )}

                                        {leave.status === 'REJECTED' && leave.reviewerComment && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                                                <p className="text-sm text-red-600">{leave.reviewerComment}</p>
                                            </div>
                                        )}

                                        {leave.approvedBy && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500">
                                                    {leave.status === 'Approved' || leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {leave.approvedBy.name}
                                                </p>
                                            </div>
                                        )}

                                        {leave.reviewedBy && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500">
                                                    {leave.status === 'Approved' || leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {leave.reviewedBy.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Apply Leave Modal */}
            {showApplyModal && (
                <ApplyLeaveModal 
                    onClose={() => setShowApplyModal(false)}
                    onSuccess={() => fetchMyLeaves()}
                />
            )}
        </div>
    );
}
