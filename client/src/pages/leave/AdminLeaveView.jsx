import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, Clock, Calendar, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useLeaveStore } from '@/store/leaveStore';
import RejectLeaveModal from './RejectLeaveModal';

export default function AdminLeaveView() {
    const { allLeaves, isLoading, fetchAllLeaves, approveLeave, isApproving } = useLeaveStore();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);

    useEffect(() => {
        fetchAllLeaves();
    }, [fetchAllLeaves]);

    const handleApprove = async (leaveId) => {
        if (confirm('Are you sure you want to approve this leave request?')) {
            await approveLeave(leaveId);
            fetchAllLeaves(); // Refresh the list
        }
    };

    const handleRejectClick = (leaveId) => {
        setSelectedLeaveId(leaveId);
        setShowRejectModal(true);
    };

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

    const filteredLeaves = allLeaves
        .filter(leave => {
            if (filterStatus !== 'All' && 
                leave.status !== filterStatus && 
                leave.status !== filterStatus.toUpperCase()) return false;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const employeeName = leave.employee?.name?.toLowerCase() || '';
                const employeeId = leave.employee?.employeeId?.toLowerCase() || '';
                return employeeName.includes(query) || employeeId.includes(query);
            }
            return true;
        });

    const stats = {
        total: allLeaves.length,
        pending: allLeaves.filter(l => l.status === 'Pending' || l.status === 'PENDING').length,
        approved: allLeaves.filter(l => l.status === 'Approved' || l.status === 'APPROVED').length,
        rejected: allLeaves.filter(l => l.status === 'Rejected' || l.status === 'REJECTED').length,
    };

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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Review and manage employee leave requests</p>
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

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Status Filter */}
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

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by employee name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
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
                        <p className="text-gray-600">
                            {searchQuery ? 'No requests match your search.' : 'No leave requests to display.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredLeaves.map((leave) => (
                            <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-6">
                                    {/* Employee Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                                            {leave.employee?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {leave.employee?.name || 'Unknown'}
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {leave.employee?.employeeId}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(leave.status)}`}>
                                                    {getStatusIcon(leave.status)}
                                                    {getStatusDisplay(leave.status)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">{formatLeaveType(leave.leaveType)}</span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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

                                            {(leave.status === 'Rejected' || leave.status === 'REJECTED') && leave.rejectionReason && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                                                    <p className="text-sm text-red-600">{leave.rejectionReason}</p>
                                                </div>
                                            )}

                                            {(leave.status === 'Rejected' || leave.status === 'REJECTED') && leave.reviewerComment && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                                                    <p className="text-sm text-red-600">{leave.reviewerComment}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {(leave.status === 'Pending' || leave.status === 'PENDING') && (
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(leave._id)}
                                                disabled={isApproving}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(leave._id)}
                                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedLeaveId && (
                <RejectLeaveModal
                    leaveId={selectedLeaveId}
                    onClose={() => {
                        setShowRejectModal(false);
                        setSelectedLeaveId(null);
                    }}
                    onSuccess={() => {
                        fetchAllLeaves();
                        setShowRejectModal(false);
                        setSelectedLeaveId(null);
                    }}
                />
            )}
        </div>
    );
}
