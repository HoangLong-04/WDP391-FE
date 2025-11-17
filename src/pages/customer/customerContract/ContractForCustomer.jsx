import React, { useEffect, useState } from "react";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";
import Contract from "./contract/Contract";
import { Loader2 } from "lucide-react";
import ContractCustomerModal from "../../../components/modal/contractModal/ContractCustomerModal";
import { useSearchParams } from "react-router";
import FullPeriodModal from "../../../components/modal/periodModal/FullPeriodModal";

function ContractForCustomer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCredentialId = searchParams.get("credentialId") || "";
  const initialAgencyId = searchParams.get("agencyId") || "";
  const [credentialId, setCredentialId] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [sort, setSort] = useState("newest");

  const [agencyList, setAgencyList] = useState([]);
  const [contractList, setContractList] = useState([]);
  const [contractDetail, setContractDetail] = useState({});
  const [periodFull, setPeriodFull] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [viewPeriod, setViewPeriod] = useState(false);

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
    const fetchContracts = async () => {
      if (!initialCredentialId || !initialAgencyId) return;
      setLoading(true);
      try {
        const response = await PublicApi.getCustomerContract(
          initialCredentialId,
          initialAgencyId,
          { page, limit, sort }
        );
        setContractList(response.data.data);
        setTotalItems(response.data.paginationInfo.total);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [initialCredentialId, initialAgencyId, page, limit, sort]);

  const handleGetContract = async () => {
    setLoading(true);
    if (!credentialId || !agencyId) {
      toast.error("Missing credential or agency!");
      setLoading(false);
      return;
    }
    setSearchParams({ credentialId, agencyId });
    try {
      const response = await PublicApi.getCustomerContract(
        credentialId,
        agencyId,
        { page, limit }
      );
      setContractList(response.data.data);
      setTotalItems(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetContractDetail = async (id) => {
    setViewLoading(true);
    try {
      const response = await PublicApi.getCustomerContractDetail(id);
      setContractDetail(response.data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleGetPeriodFullPayment = async (id) => {
    try {
      const response = await PublicApi.getContractFullPayment(id);
      setPeriodFull(response.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
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

  useEffect(() => {
    if (credentialId && agencyId) handleGetContract();
  }, [page]);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Search Customer Contracts
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
                value={agencyId || initialAgencyId}
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
              <label className="text-sm font-medium text-gray-700">Sort</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGetContract}
              disabled={loading}
              className="flex items-center gap-2 cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : contractList.length > 0 ? (
            contractList.map((c) => (
              <Contract
                contractId={c.id}
                agencyId={c.agencyId}
                colorId={c.colorId}
                content={c.content}
                contractDocuments={c.contractDocuments}
                contractType={c.contractPaidType}
                createAt={c.createAt}
                customerId={c.customerId}
                depositAmount={c.depositAmount}
                installmentContract={c.installmentContract}
                motorbikeId={c.electricMotorbikeId}
                quotation={c.quotation}
                staffId={c.staffId}
                status={c.status}
                title={c.title}
                totalAmount={c.finalPrice}
                type={c.type}
                onOpen={() => setOpen(true)}
                onViewDetail={() =>
                  handleGetContractDetail(c.installmentContract.id)
                }
                onGetPeriod={() => handleGetPeriodFullPayment(c.id)}
                viewPeriod={() => setViewPeriod(true)}
                loading={viewLoading}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              No contracts found.
            </div>
          )}
        </div>

        {/* Pagination */}
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

      <ContractCustomerModal
        data={contractDetail}
        isOpen={open}
        loading={viewLoading}
        onClose={() => setOpen(false)}
        title={"Contract"}
      />

      <FullPeriodModal
        onClose={() => setViewPeriod(false)}
        open={viewPeriod}
        periods={periodFull}
      />
    </div>
  );
}

export default ContractForCustomer;
