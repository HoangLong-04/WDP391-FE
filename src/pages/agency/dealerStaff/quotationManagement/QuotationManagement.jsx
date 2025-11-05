import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaffApi from "../../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import { formatCurrency } from "../../../../utils/currency";
import dayjs from "dayjs";

function QuotationManagement() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [quoteCode, setQuoteCode] = useState("");

  useEffect(() => {
    if (user?.agencyId) {
      fetchQuotations();
    }
  }, [page, limit, type, status, quoteCode, user?.agencyId]);

  const fetchQuotations = async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(type && { type }),
        ...(status && { status }),
        ...(quoteCode && { quoteCode }),
      };
      const res = await PrivateDealerStaffApi.getQuotationList(user.agencyId, params);
      setQuotations(res.data?.data || []);
      setTotalItem(res.data?.paginationInfo?.total || 0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "quoteCode",
      title: "Quote Code",
      render: (code) => (
        <span className="font-mono text-xs">{code}</span>
      ),
    },
    {
      key: "createDate",
      title: "Create Date",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      key: "type",
      title: "Type",
      render: (type) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
          {type}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (status) => {
        const statusColors = {
          DRAFT: "bg-gray-100 text-gray-700",
          ACCEPTED: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
          EXPIRED: "bg-orange-100 text-orange-700",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "basePrice",
      title: "Base Price",
      render: (price) => formatCurrency(price),
    },
    {
      key: "promotionPrice",
      title: "Promotion Price",
      render: (price) => formatCurrency(price),
    },
    {
      key: "finalPrice",
      title: "Final Price",
      render: (price) => (
        <span className="font-semibold text-indigo-600">
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      key: "validUntil",
      title: "Valid Until",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      key: "customerId",
      title: "Customer ID",
    },
    {
      key: "motorbikeId",
      title: "Motorbike ID",
    },
    {
      key: "colorId",
      title: "Color ID",
    },
  ];

  return (
    <div>
      <div className="my-3 flex flex-wrap gap-4 items-center justify-end">
        <div>
          <label className="mr-2 font-medium text-gray-600">Type:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="AT_STORE">AT_STORE</option>
            <option value="ORDER">ORDER</option>
            <option value="PRE_ORDER">PRE_ORDER</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Status:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Quote Code:</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={quoteCode}
            onChange={(e) => {
              setQuoteCode(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code..."
          />
        </div>
      </div>
      <PaginationTable
        columns={columns}
        data={quotations}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title="Quotation Management"
        totalItem={totalItem}
      />
    </div>
  );
}

export default QuotationManagement;

