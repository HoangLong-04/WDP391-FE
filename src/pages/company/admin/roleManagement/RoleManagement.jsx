import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import EditIcon from "@mui/icons-material/Edit";

function RoleManagement() {
  const [role, setRole] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);
      try {
        const response = await PrivateAdminApi.getRole();
        setRole(response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  const columns = [
    { key: "id", title: "Id" },
    { key: "roleName", title: "Role" },
    {
      key: "isActive",
      title: "Status",
      render: (isActive) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            isActive ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isActive ? "Active" : "Not active"}
        </span>
      ),
    },
    {
      key: "isDeleted",
      title: "Available",
      render: (isDeleted) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            isDeleted ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isDeleted ? "Active" : "Not active"}
        </span>
      ),
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
      <div className="my-3"></div>
      <PaginationTable
        columns={columns}
        title={"Role Management"}
        data={role}
        page={1}
        loading={loading}
        pageSize={10}
      />
    </div>
  );
}

export default RoleManagement;
