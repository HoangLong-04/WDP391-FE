/**
 * Render status tag với style đồng bộ cho tất cả các bảng
 * @param {string} status - Status value (ACTIVE, INACTIVE, PENDING, CONFIRMED, etc.)
 * @returns {JSX.Element} Status tag component
 */
export const renderStatusTag = (status) => {
  if (!status) return null;

  const statusUpper = status.toUpperCase();
  
  // Mapping statuses with colors and labels
  const statusConfig = {
    // Active/Inactive states
    ACTIVE: { bg: "bg-green-500", label: "Active" },
    INACTIVE: { bg: "bg-red-500", label: "Inactive" },
    
    // Contract/Order statuses
    DRAFT: { bg: "bg-slate-500", label: "Draft" },
    PENDING: { bg: "bg-amber-500", label: "Pending" },
    APPROVED: { bg: "bg-indigo-500", label: "Approved" },
    CONFIRMED: { bg: "bg-blue-500", label: "Confirmed" },
    PROCESSING: { bg: "bg-sky-500", label: "Processing" },
    DELIVERED: { bg: "bg-teal-500", label: "Delivered" },
    PAID: { bg: "bg-emerald-500", label: "Paid" },
    COMPLETED: { bg: "bg-green-600", label: "Completed" },
    CANCELED: { bg: "bg-rose-500", label: "Canceled" },
    CANCELLED: { bg: "bg-rose-500", label: "Cancelled" },
    // Booking statuses
    ACCEPTED: { bg: "bg-green-500", label: "Accepted" },
    REJECTED: { bg: "bg-red-500", label: "Rejected" },
    
    // Default fallback
    default: { bg: "bg-gray-500", label: status },
  };

  const config = statusConfig[statusUpper] || statusConfig.default;

  return (
    <span
      className={`px-3 py-1 rounded-full text-white text-sm font-medium ${config.bg}`}
    >
      {config.label}
    </span>
  );
};

