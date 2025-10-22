import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import EditIcon from "@mui/icons-material/Edit";

function AgencyManagement() {
  const [agency, setAgency] = useState([]);
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [totalItem, setTotalItem] = useState(null)
  const [loading, setLoading] = useState(false);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchAgency = async () => {
      setLoading(true);
      try {
        const response = await PrivateAdminApi.getAgency({
          page,
          limit,
          location,
          address,
        });
        setAgency(response.data.data);
        setTotalItem(response.data.paginationInfo.total)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [page, limit, location, address]);

  const columns = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "location", title: "Location" },
    { key: "address", title: "Address" },
    { key: "contactInfo", title: "Contact info" },
    {
      key: "status",
      title: "Status",
      render: (status) => <span>{status ? "Acitve" : "No Acitve"}</span>,
    },
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
          <label className="mr-2 font-medium text-gray-600">Location:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="USA">USA</option>
            <option value="China">China</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Address:</label>
          <input
            placeholder="Address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="text"
          />
        </div>
      </div>
      <PaginationTable
        data={agency}
        columns={columns}
        pageSize={limit}
        page={page}
        loading={loading}
        title={"Agency management"}
        setPage={setPage}
        totalItem={totalItem}
      />
    </div>
  );
}

export default AgencyManagement;
