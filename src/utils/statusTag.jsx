/**
 * Render status tag với style đồng bộ cho tất cả các bảng
 * @param {string} status - Status value (ACTIVE, INACTIVE, PENDING, CONFIRMED, etc.)
 * @returns {JSX.Element} Status tag component
 */
export const renderStatusTag = (status) => {
  if (!status) return null;

  const statusUpper = status.toUpperCase();
  
  // Mapping các status với màu và label
  const statusConfig = {
    // Active/Inactive states
    ACTIVE: { bg: "bg-green-500", label: "Active" },
    INACTIVE: { bg: "bg-red-500", label: "Inactive" },
    
    // Contract/Order statuses
    PENDING: { bg: "bg-yellow-500", label: "Pending" },
    CONFIRMED: { bg: "bg-blue-500", label: "Confirmed" },
    PROCESSING: { bg: "bg-blue-500", label: "Processing" },
    DELIVERED: { bg: "bg-green-500", label: "Delivered" },
    COMPLETED: { bg: "bg-green-500", label: "Completed" },
    CANCELED: { bg: "bg-red-500", label: "Canceled" },
    CANCELLED: { bg: "bg-red-500", label: "Cancelled" },
    DRAFT: { bg: "bg-gray-500", label: "Draft" },
    PAID: { bg: "bg-green-500", label: "Paid" },
    
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

