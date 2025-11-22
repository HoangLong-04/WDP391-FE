import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import useAgencyList from "../../../hooks/useAgencyList";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import GroupModal from "../../../components/modal/groupModal/GroupModal";
import {
  creditGeneralField,
  creditGroupField,
} from "../../../components/viewModel/creditLineModel/CreditLineModel";
function CreditLineManagement() {
  const { agencyList } = useAgencyList();
  const [creditLineList, setCreditLineList] = useState([]);
  const [creditDetail, setCreditDetail] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [agencyId, setAgencyId] = useState("");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [detailModal, setDetailModal] = useState(false);

  const fetchCreditLine = async () => {
    setLoading(true);
    try {
      const response = await PrivateAdminApi.getCreditLineList({
        page,
        limit,
        agencyId,
        sort,
      });
      setCreditLineList(response.data.data);
      setTotalItems(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditDetail = async (id) => {
    setDetailLoading(true);
    try {
      const response = await PrivateAdminApi.getCreditLineDetail(id);
      setCreditDetail(response.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditLine();
  }, [page, agencyId, sort]);

  const columns = [
    { key: "id", title: "Id" },
    {
      key: "creditLimit",
      title: "Limit",
      render: (data) => data.toLocaleString() + " đ",
    },
    {
      key: "currentDebt",
      title: "Current Debt",
      render: (data) => (data !== undefined && data !== null ? data.toLocaleString() + " đ" : "0 đ"),
    },
    { key: "warningThreshold", title: "Threshold", render: (data) => data + " %", },
    { key: "overDueThreshHoldDays", title: "Over due days" },
    {
      key: "isBlocked",
      title: "Available",
      render: (data) => {
        const isAvailable = data !== true;
        return (
          <span className={`font-semibold ${isAvailable ? "text-green-600" : "text-red-600"}`}>
            {isAvailable ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      key: "agencyId",
      title: "Agency",
      render: (agencyId) => {
        const agency = agencyList.find((a) => a.id === agencyId);
        return agency ? agency.name : agencyId;
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-end gap-5 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Sort:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Agency:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={agencyId}
            onChange={(e) => {
              setAgencyId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {agencyList.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        data={creditLineList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Credit line"}
        totalItem={totalItems}
        onRowClick={(item) => {
          setDetailModal(true);
          fetchCreditDetail(item.id);
        }}
      />

      <GroupModal
        data={creditDetail}
        groupedFields={creditGroupField}
        isOpen={detailModal}
        loading={detailLoading}
        onClose={() => setDetailModal(false)}
        title={"Credit info"}
        generalFields={creditGeneralField}
      />

    </div>
  );
}

export default CreditLineManagement;
