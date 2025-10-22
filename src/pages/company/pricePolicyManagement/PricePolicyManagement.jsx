import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import EditIcon from "@mui/icons-material/Edit";
import PaginationTable from "../../../components/paginationTable/PaginationTable";

function PricePolicyManagement() {
  const [priceList, setPriceList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItem, setTotalItem] = useState(null)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPriceList = async () => {
      setLoading(true);
      try {
        const response = await PrivateAdminApi.getPricePolicy({ page, limit });
        setPriceList(response.data.data);
        setTotalItem(response.data.pagination.total)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceList();
  }, [page, limit]);

  const columns = [
    { key: "id", title: "Id" },
    { key: "title", title: "Title" },
    { key: "content", title: "Content" },
    { key: "policy", title: "Policy" },
    {
      key: "wholesalePrice",
      title: "Price",
      render: (wholesalePrice) => {
        return `${wholesalePrice.toLocaleString()} đ`
      },
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
      <div className="my-3"></div>
      <PaginationTable
        data={priceList}
        page={page}
        setPage={setPage}
        loading={loading}
        columns={columns}
        title={"Price Policy"}
        pageSize={limit}
        totalItem={totalItem}
      />
    </div>
  );
}

export default PricePolicyManagement;
