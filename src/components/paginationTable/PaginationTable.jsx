import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function PaginationTable({
  title,
  columns,
  data,
  page,
  setPage,
  loading,
  pageSize,
  totalItem,
}) {
  // tối đa 8 item mỗi trang
  const totalPage = Math.ceil(totalItem / pageSize);
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

      <div className="overflow-x-scroll h-[450px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-[rgb(181,183,192)]">
              {columns.map((col) => (
                <th key={col.key} className="p-3">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6">
                  <CircularProgress className="animate-spin text-blue-500" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-gray-500 text-center py-6"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id ?? idx}
                  className="border-[rgb(181,183,192)] hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-3">
                      {col.render
                        ? col.render(item[col.key], item)
                        : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mt-4 gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-2 cursor-pointer flex items-center justify-center py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowBackIosIcon />
          </button>

          {Array.from({ length: totalPage }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-2.5 py-1 rounded-md text-sm cursor-pointer ${
                page === num
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPage}
            className="px-2 cursor-pointer flex items-center justify-center py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowForwardIosIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginationTable;
