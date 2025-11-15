import React, { useEffect, useMemo, useState } from "react";
import BaseModal from "../baseModal/BaseModal";
import dayjs from "dayjs";
import CircularProgress from "@mui/material/CircularProgress";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";

function ContractCustomerModal({ isOpen, onClose, title, data, loading }) {
  const payments = useMemo(() => data?.installmentPayments || [], [data]);
  const [selected, setSelected] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleMakePayment = async (id) => {
    setPaymentLoading(true);
    try {
      const response = await PublicApi.payCustomerInstallment("web", {
        installmentScheduleId: id,
      });
      toast.success("Request payment success");
      window.location.href = response.data.data.paymentUrl;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (payments.length > 0) {
      setSelected(payments[0]);
    }
  }, [payments]);

  const formatCurrency = (value) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "0 VND";
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {loading ? (
        <div className="flex justify-center py-6">
          <CircularProgress />
        </div>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-500 py-4">There is no period.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {payments
              .slice()
              .sort((a, b) => new Date(a.period) - new Date(b.period))
              .map((p) => {
                const label = dayjs(p.period).format("DD/MM/YYYY");
                const isActive = selected?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
          </div>

          {selected ? (
            <div className="p-5 border border-gray-200 rounded-xl shadow-sm bg-gray-50 space-y-3 transition-all">
              <h3 className="text-lg font-semibold text-gray-800">
                Period — {dayjs(selected.period).format("DD/MM/YYYY")}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info
                  label="Amount"
                  value={formatCurrency(selected.amountDue)}
                />
                <Info
                  label="Amount paid"
                  value={formatCurrency(selected.amountPaid)}
                />
                <Info
                  label="Penalty"
                  value={formatCurrency(selected.penaltyAmount)}
                />
                <Info label="Status" value={selected.status} />
                <Info
                  label="Due date"
                  value={
                    selected.period
                      ? dayjs(selected.period).format("DD/MM/YYYY")
                      : "-"
                  }
                />
                <Info
                  label="Paid date"
                  value={
                    selected.paidDate
                      ? dayjs(selected.paidDate).format("DD/MM/YYYY")
                      : "-"
                  }
                />
                <div />
                {selected.status !== "PAID" && (
                  <div className="flex justify-end">
                    <button
                      disabled={paymentLoading}
                      onClick={() => handleMakePayment(selected.id)}
                      className={`p-2 flex items-center justify-center gap-2 rounded-lg text-white transition cursor-pointer ${
                        paymentLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {paymentLoading ? (
                        <>
                          <CircularProgress size={18} color="inherit" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        "Pay"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center italic">
              Choose 1 period to view detail
            </p>
          )}
        </div>
      )}
    </BaseModal>
  );
}
function Info({ label, value }) {
  return (
    <div className="flex justify-between bg-white p-2 rounded-md border border-gray-100">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

export default ContractCustomerModal;
