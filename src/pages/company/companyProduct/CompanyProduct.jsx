import React, { useState } from "react";
import { Pencil } from "lucide-react";
import PaginationTable from "../../../components/paginationTable/PaginationTable";

function CompanyProduct() {
  const [page, setPage] = useState(1);

  const paginationData = [
    {
      id: 1,
      name: "Jane Cooper",
      version: "Microsoft",
      color: "(225) 555-0118",
      status: "Active",
    },
    {
      id: 2,
      name: "Floyd Miles",
      version: "Yahoo",
      color: "(205) 555-0100",
      status: "Active",
    },
    {
      id: 3,
      name: "Ronald Richards",
      version: "Adobe",
      color: "(302) 555-0107",
      status: "Active",
    },
    {
      id: 4,
      name: "Marvin McKinney",
      version: "Tesla",
      color: "(252) 555-0126",
      status: "Out of Stock",
    },
    {
      id: 5,
      name: "Jerome Bell",
      version: "Google",
      color: "(629) 555-0129",
      status: "Inactive",
    },
    {
      id: 6,
      name: "Kathryn Murphy",
      version: "Microsoft",
      color: "(406) 555-0120",
      status: "Out of Stock",
    },
    {
      id: 7,
      name: "Jacob Jones",
      version: "Yahoo",
      color: "(208) 555-0112",
      status: "Out of Stock",
    },
    {
      id: 8,
      name: "Kristin Watson",
      version: "Facebook",
      color: "(704) 555-0127",
      status: "Inactive",
    },
    {
      id: 9,
      name: "Kristin Watson",
      version: "Facebook",
      color: "(704) 555-0127",
      status: "Inactive",
    },
  ];

  const columns = [
    { key: "name", title: "Model Name" },
    { key: "version", title: "Version" },
    { key: "color", title: "Color" },
    { key: "status", title: "Status" },
    {
      key: "action",
      title: "Action",
      render: () => (
        <span className="cursor-pointer text-blue-500">
          <Pencil className="w-5 h-5" />
        </span>
      ),
    },
  ];
  return (
    <PaginationTable
      title="All Products"
      columns={columns}
      data={paginationData}
      page={page}
      setPage={setPage}
    />
  );
}

export default CompanyProduct;
