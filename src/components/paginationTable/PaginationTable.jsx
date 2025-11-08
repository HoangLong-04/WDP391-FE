import CircularProgress from "@mui/material/CircularProgress";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PaginationTable({
  title,
  columns,
  data,
  page,
  setPage,
  loading,
  pageSize,
  totalItem,
  onRowClick,
}) {
  // tối đa 8 item mỗi trang
  const totalPage = Math.ceil(totalItem / pageSize);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 w-full">
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 border-b border-gray-200 pb-2 sm:pb-3">
          {title}
        </h2>
      )}

      <div className="overflow-x-auto overflow-y-auto h-[450px] rounded-lg border border-gray-200">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <CircularProgress className="text-blue-500" size={40} />
                    <span className="text-gray-500 text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="text-gray-500 font-medium">No data available</span>
                  </div>
                </td>
              </tr>
            ) : (
              data?.map((item, idx) => (
                <tr
                  key={item.id ?? idx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150 group ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-gray-700 group-hover:text-gray-900 whitespace-nowrap">
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

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
          Showing page <span className="font-semibold text-gray-800">{page}</span> of{" "}
          <span className="font-semibold text-gray-800">{totalPage}</span>
        </div>
        <div className="flex gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-2 sm:px-3 py-2 cursor-pointer flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPage }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-2 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 ${
                page === num
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:scale-105"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPage}
            className="px-2 sm:px-3 py-2 cursor-pointer flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginationTable;
