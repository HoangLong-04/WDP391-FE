import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import PaginationTable from "../../../components/paginationTable/PaginationTable";

function PromotionManagement() {
  const [promotion, setPromotion] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(null)
  const [valueType, setValueType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      setLoading(true);
      try {
        const response = await PrivateAdminApi.getPromotionList({
          page,
          limit,
          valueType,
        });
        setPromotion(response.data.data);
        setTotalItem(response.data.paginationInfo.total)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [page, limit, valueType]);

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "description", title: "Description" },
    { key: "valueType", title: "Type value" },
    { key: "value", title: "Value" },
    {
      key: "startAt",
      title: "Start date",
      render: (startAt) => dayjs(startAt).format("DD/MM/YYYY"),
    },
    {
      key: "endAt",
      title: "End date",
      render: (endAt) => dayjs(endAt).format("DD/MM/YYYY"),
    },
    {
      key: "status",
      title: "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "agencyId", title: "Agency" },
    { key: "motorbikeId", title: "Motorbike" },
    {
      key: "action",
      title: "Action",
      render: () => (
        <span className="cursor-pointer text-blue-500">
          <EditIcon />
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="my-3 flex justify-end">
        <div>
          <label className="mr-2 font-medium text-gray-600">Type value:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={valueType}
            onChange={(e) => {
              setValueType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
          </select>
        </div>
      </div>
      <PaginationTable
        data={promotion}
        title={"Promotion Management"}
        page={page}
        setPage={setPage}
        loading={loading}
        columns={columns}
        pageSize={limit}
        totalItem={totalItem}
      />
    </div>
  );
}

export default PromotionManagement;
