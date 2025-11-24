import { CreditCard, AlertCircle, ShieldCheck } from "lucide-react";

export default function CreditLineCard({ data, loading }) {
  if (loading) return <SkeletonCard />;

  if (!data)
    return (
      <div className="modern-card">
        <p className="text-gray-400">No credit line data</p>
      </div>
    );

  const { creditLimit, currentDebt, warningThreshold, overDueThreshHoldDays, isBlocked } =
    data;

  return (
    <div className="modern-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-wrapper">
          <CreditCard className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-white">Credit Line</h2>
      </div>

      <div className="info-row">
        <span className="label">Credit Limit</span>
        <span className="value">{creditLimit?.toLocaleString()}₫</span>
      </div>

      <div className="info-row">
        <span className="label">Current Debt</span>
        <span className="value">{(currentDebt !== undefined && currentDebt !== null ? currentDebt : 0).toLocaleString()}₫</span>
      </div>

      <div className="info-row">
        <span className="label">Warning Threshold</span>
        <span className="value">{warningThreshold}%</span>
      </div>

      <div className="info-row">
        <span className="label">Overdue Days</span>
        <span className="value">{overDueThreshHoldDays} days</span>
      </div>

      <div className="info-row">
        <span className="label">Status</span>
        <span
          className={`value font-semibold ${
            isBlocked ? "text-red-400" : "text-green-400"
          }`}
        >
          {isBlocked ? "Blocked" : "Active"}
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="modern-card animate-pulse">
      <div className="skeleton h-6 w-2/3 mb-4"></div>
      <div className="skeleton h-4 w-full mb-2"></div>
      <div className="skeleton h-4 w-3/4 mb-2"></div>
      <div className="skeleton h-4 w-1/2 mb-2"></div>
      <div className="skeleton h-4 w-1/3"></div>
    </div>
  );
}
