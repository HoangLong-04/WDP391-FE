import React, { useEffect, useState } from "react";
import PublicApi from "../../../services/PublicApi";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import QuotationCard from "./quotationCard/QuotationCard";
import { useSearchParams } from "react-router";
import DepositModal from "../../../components/modal/depositModal/DepositModal";

function CustomerQuotation() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCredentialId = searchParams.get("credentialId") || "";
  const [quotationList, setQuotationList] = useState([]);
  const [agencyList, setAgencyList] = useState([]);
  const [deposit, setDeposit] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [credentialId, setCredentialId] = useState("");
  const [quoteCode, setQuoteCode] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchAgencyList = async () => {
      try {
        const response = await PublicApi.getAgencyListCustomer({
          page: 1,
          limit: 30,
        });
        setAgencyList(response.data.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchAgencyList();
  }, []);

  useEffect(() => {
    const fecthQuotation = async () => {
      if (!initialCredentialId) return;
      try {
        const response = await PublicApi.getQuotationList(initialCredentialId, {
          page,
          limit,
          type,
          status,
          quoteCode,
          agencyId,
        });
        setQuotationList(response.data.data);
        setTotalItems(response.data.paginationInfo.total);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fecthQuotation();
  }, [page, limit, type, status, quoteCode, agencyId, initialCredentialId]);

  const handleGetQuotationList = async () => {
    setLoading(true);
    if (!credentialId) {
      toast.error("Missing credential id");
      setLoading(false);
      return;
    }
    setSearchParams({ credentialId });
    try {
      const response = await PublicApi.getQuotationList(credentialId, {
        page,
        limit,
        type,
        status,
        quoteCode,
        agencyId,
      });
      setQuotationList(response.data.data);
      setTotalItems(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDeposit = async (id) => {
    setViewLoading(true);
    try {
      const response = await PublicApi.getDeposit(id);
      setDeposit(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleNext = () => {
    if (page < Math.ceil(totalItems / limit)) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const statusList = ["DRAFT", "ACCEPTED", "REJECTED", "EXPIRED", "REVERSED"];
  const typeList = ["AT_STORE", "ORDER", "PRE_ORDER"];

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Search Customer Quotation
        </h1>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Credential ID */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Credential ID
              </label>
              <input
                type="text"
                value={credentialId || initialCredentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter customer credential ID..."
              />
            </div>

            {/* Agency */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Agency
              </label>
              <select
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Select agency</option>
                {agencyList.length === 0 && (
                  <option disabled>Loading...</option>
                )}
                {agencyList?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Select status</option>
                {statusList.map((t) => (
                  <option value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Select type</option>
                {typeList.map((t) => (
                  <option value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Quotecode
              </label>
              <input
                type="text"
                value={quoteCode}
                onChange={(e) => setQuoteCode(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter quote code..."
              />
            </div>
            <div className="flex justify-end items-end">
              <button
                onClick={handleGetQuotationList}
                disabled={loading}
                className="flex items-center gap-2 cursor-pointer bg-blue-600 text-white px-5 py-2 h-fit rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : quotationList.length > 0 ? (
            quotationList.map((c) => (
              <QuotationCard
                quotation={c}
                onViewDetail={() => {
                  handleGetDeposit(c.id);
                  setOpen(true);
                }}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              No quotations found.
            </div>
          )}
        </div>

        {totalItems > limit && (
          <div className="flex justify-center items-center gap-6 pt-6">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700 font-medium">
              {page} / {Math.ceil(totalItems / limit)}
            </span>
            <button
              onClick={handleNext}
              disabled={page === Math.ceil(totalItems / limit)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <DepositModal
        data={deposit}
        isOpen={open}
        loading={loading}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export default CustomerQuotation;
