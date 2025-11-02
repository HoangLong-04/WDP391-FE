import React, { useEffect, useState } from "react";
import ProductHeader from "../../../components/productHeader/ProductHeader";
import BikeCard from "../../../components/bikeCard/BikeCard";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";

function Product() {
  const [motorList, setMotorList] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [makeList, setMakeList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [model, setModel] = useState("");
  const [makeForm, setMakeForm] = useState("");
  const [totalItem, setTotalItem] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchMotorList = async () => {
    setLoading(true);
    try {
      const response = await PublicApi.getMotorList({
        page,
        limit,
        makeForm,
        model,
      });
      setMotorList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilter = async () => {
      try {
        const response = await PublicApi.getMotorFilters();
        const data = response.data.data;
        setModelList(data.modelFilters);
        setMakeList(data.makeFromFilter);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchFilter();
  }, []);

  useEffect(() => {
    fetchMotorList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, makeForm, model, limit]);

  const TOTAL_PAGE = Math.ceil(totalItem / limit);

  return (
    <div>
      <header className="p-10">
        <ProductHeader
          makeFrom={makeForm}
          makeList={makeList}
          model={model}
          modelList={modelList}
          setMakeFrom={setMakeForm}
          setModel={setModel}
          setPage={setPage}
        />
      </header>
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-10 text-lg text-gray-500">
            Đang tải danh sách xe...
          </div>
        )}
        {!loading && motorList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {motorList.map((m) => (
              <BikeCard
                key={m.id}
                id={m.id}
                image={m.images[0]?.imageUrl}
                name={m.name}
                price={m.price}
              />
            ))}
          </div>
        )}
        {TOTAL_PAGE > 1 && (
          <div className="flex items-center justify-center space-x-6 mt-12 mb-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center px-4 py-2 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md transition-all duration-200 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <div className="flex items-center justify-center text-xl font-bold text-gray-700">
              <span className="text-indigo-600">{page}</span>
              <span className="mx-2">/</span>
              <span>{TOTAL_PAGE}</span>
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === TOTAL_PAGE}
              className="flex items-center justify-center px-4 py-2 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md transition-all duration-200 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Product;
