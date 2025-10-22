import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import PaginationTable from "../../../components/paginationTable/PaginationTable";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";

function DiscountManagement() {
  const [discount, setDiscount] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState("");
  const [valueType, setValueType] = useState("");
  const [totalItem, setTotalItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiscount = async () => {
      setLoading(true);
      try {
        const response = await PrivateAdminApi.getDiscountList({
          page,
          limit,
          type,
          valueType,
        });
        setDiscount(response.data.data);
        setTotalItem(response.data.paginationInfo.total);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [page, limit, type, valueType]);

  const columns = [
    { key: "id", title: "Id" },
    // { key: "avatar", title: "User name" },
    { key: "name", title: "Name" },
    { key: "type", title: "Type" },
    { key: "valueType", title: "Value type" },
    { key: "value", title: "Value" },
    { key: "min_quantity", title: "Min quantity" },
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
    { key: "motorbikeId", title: "Motor" },
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
      <div className="flex justify-end gap-5 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Type:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="VOLUME">VOLUME</option>
            <option value="SPECIAL">SPECIAL</option>
          </select>
        </div>
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
        columns={columns}
        page={page}
        setPage={setPage}
        data={discount}
        pageSize={limit}
        title={"Disscount Management"}
        loading={loading}
        totalItem={totalItem}
      />
    </div>
  );
}

export default DiscountManagement;
