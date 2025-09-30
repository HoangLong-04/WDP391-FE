import React, { useState } from "react";
import PaginationTable from "../../../components/paginationTable/PaginationTable";

function DealerManager() {
  const [page, setPage] = useState(1);
  const dealerAcc = [
    {
      name: "Long",
      email: "longfg@gmail.com",
      phone: "0849017399",
      agency: "HCM",
      status: "Active",
    },
    {
      name: "Long",
      email: "longfg@gmail.com",
      phone: "0849017399",
      agency: "HCM",
      status: "Active",
    },
    {
      name: "Long",
      email: "longfg@gmail.com",
      phone: "0849017399",
      agency: "HCM",
      status: "Active",
    },
    {
      name: "Long",
      email: "longfg@gmail.com",
      phone: "0849017399",
      agency: "HCM",
      status: "Active",
    },
    {
      name: "Long",
      email: "longfg@gmail.com",
      phone: "0849017399",
      agency: "HCM",
      status: "Inactive",
    },
  ];
  const column = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    { key: "agency", title: "Agency" },
    {
      key: "status",
      title: "Status",
      render: (status) => (
        <span
          className={`text-white font-semibold py-1 px-2 rounded-2xl ${
            status === "Active" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status}
        </span>
      ),
    },
  ];
  return (
    <div>
      <PaginationTable
        title={"Dealer management"}
        columns={column}
        data={dealerAcc}
        setPage={setPage}
        page={page}
      />
    </div>
  );
}

export default DealerManager;
