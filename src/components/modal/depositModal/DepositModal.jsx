import dayjs from "dayjs";
import { Banknote, Calendar, Percent, Hash, CheckCircle } from "lucide-react";
import { CircularProgress } from "@mui/material";
import BaseModal from "../baseModal/BaseModal";
import { useState } from "react";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";

function DepositModal({ isOpen, onClose, data, loading }) {
  const [payLoading, setPayLoading] = useState(false);
  if (!data) return null;

  const { id, depositPercent, depositAmount, holdDays, status, quotationId } =
    data;

  const handlePayDeposit = async (id) => {
    setPayLoading(true);
    try {
      const response = await PublicApi.paymentDeposit("web", { depositId: id });
      toast.success("Get payment success");
      window.location.href = response.data.data.paymentUrl;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setPayLoading(false);
    }
  };

  const formatCurrency = (value) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const statusColor =
    status === "PENDING"
      ? "bg-yellow-100 text-yellow-800"
      : status === "APPLIED"
      ? "bg-green-100 text-green-800"
      : status === "EXPIRED"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit Information"
      size="md"
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <CircularProgress />
        </div>
      ) : (
        <div className="space-y-5 text-gray-700">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Banknote className="w-5 h-5 text-green-500" />
              Deposit ID: <span className="text-blue-600">#{id}</span>
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor}`}
            >
              {status}
            </span>
          </div>

          {/* Body Info */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-5 text-sm">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-500" />
              <span>Deposit Percent:</span>
            </div>
            <p className="font-medium">{depositPercent}%</p>

            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-green-500" />
              <span>Deposit Amount:</span>
            </div>
            <p className="font-medium text-green-600">
              {formatCurrency(depositAmount)}
            </p>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Hold Until:</span>
            </div>
            <p className="font-medium">
              {dayjs(holdDays).format("DD/MM/YYYY")}
            </p>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              <span>Quotation ID:</span>
            </div>
            <p className="font-medium">{quotationId}</p>
          </div>

          {/* Footer */}
          {status === "PENDING" && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => handlePayDeposit(id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Deposit
              </button>
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
}

export default DepositModal;
