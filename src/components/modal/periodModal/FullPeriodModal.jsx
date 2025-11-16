import React, { useState } from "react";
import BaseModal from "../baseModal/BaseModal";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";

function FullPeriodModal({ open, onClose, periods }) {
  const [activeTab, setActiveTab] = useState(periods?.[0]?.period || 1);

  const activeData = periods.find((p) => p.period === activeTab);

  const handleMakeFullPayment = async (id) => {
    try {
      const response = await PublicApi.payFullContract("web", {
        periodId: id,
      });
      toast.success("Request payment success");
      window.location.href = response.data.data.paymentUrl;
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <BaseModal isOpen={open} onClose={onClose} title="Payment Periods">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {periods.map((p) => (
          <button
            key={p.period}
            onClick={() => setActiveTab(p.period)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition
              ${
                activeTab === p.period
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            `}
          >
            Period {p.period}
          </button>
        ))}
      </div>

      {activeData && (
        <div className="space-y-4">
          <InfoRow
            icon={<Calendar className="w-5 h-5 text-gray-500" />}
            label="Created At"
            value={formatDate(activeData.createAt)}
          />

          <InfoRow
            icon={<Clock className="w-5 h-5 text-gray-500" />}
            label="Amount"
            value={activeData.amount?.toLocaleString() + "₫"}
          />

          <InfoRow
            icon={<CheckCircle className="w-5 h-5 text-gray-500" />}
            label="Paid At"
            value={
              activeData.paidAt ? formatDate(activeData.paidAt) : "Not paid yet"
            }
            valueClass={activeData.paidAt ? "text-green-600" : "text-red-500"}
          />
          {!activeData.paidAt && (
            <div className="flex justify-end">
              <button
                onClick={() => handleMakeFullPayment(activeData.id)}
                className="p-2 bg-blue-500 hover:bg-blue-600 transition rounded-lg cursor-pointer text-white"
              >
                Pay
              </button>
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
}

function InfoRow({ icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default FullPeriodModal;
