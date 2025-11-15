import React from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";

function DataTable({
  title,
  columns,
  data,
  page,
  setPage,
  loading,
  totalItem,
  limit = 5,
  onRowClick,
  actions = [],
  emptyMessage = "No data available",
}) {
  const totalPage = Math.ceil(totalItem / limit);

  // Default actions if not provided
  const defaultActions = actions.length > 0 ? actions : [];

  // Combine columns with actions column if actions exist
  const allColumns = [
    ...columns,
    ...(defaultActions.length > 0
      ? [
          {
            key: "actions",
            title: "Actions",
            render: (_, item) => (
              <div className="flex gap-2 items-center justify-center">
                {defaultActions
                  .filter((action) => !action.show || action.show(item))
                  .map((action, idx) => {
                    const Icon = action.icon || Eye;
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick && action.onClick(item);
                        }}
                        className={`cursor-pointer text-white p-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center ${
                          action.type === "view"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : action.type === "edit"
                            ? "bg-green-500 hover:bg-green-600"
                            : action.type === "delete"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        }`}
                        title={action.label || action.type}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 w-full">
      {title && (
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800 border-b border-gray-200 pb-3">
          {title}
        </h2>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr className="border-b border-gray-200">
              {allColumns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap text-center"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <>
                {Array.from({ length: limit }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-b border-gray-100">
                    {allColumns.map((col) => (
                      <td key={col.key} className="p-3 md:p-4 text-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <span className="text-gray-500 font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data?.map((item, idx) => (
                <tr
                  key={item.id ?? idx}
                  className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {allColumns.map((col) => (
                    <td
                      key={col.key}
                      className="p-3 md:p-4 text-xs md:text-sm text-gray-700 whitespace-nowrap text-center"
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : item[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
          Showing page <span className="font-semibold text-gray-800">{page}</span> of{" "}
          <span className="font-semibold text-gray-800">{totalPage || 1}</span>
        </div>
        <div className="flex gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 cursor-pointer flex items-center justify-center rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(totalPage, 10) }, (_, i) => i + 1).map((num) => {
            // Show page numbers with ellipsis for large page counts
            if (totalPage > 10) {
              if (num <= 3 || num > totalPage - 3 || (num >= page - 1 && num <= page + 1)) {
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                      page === num
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:scale-105"
                    }`}
                  >
                    {num}
                  </button>
                );
              } else if (num === 4 || num === totalPage - 3) {
                return (
                  <span key={num} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            }
            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                  page === num
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:scale-105"
                }`}
              >
                {num}
              </button>
            );
          })}

          <button
            onClick={() => setPage(Math.min(totalPage, page + 1))}
            disabled={page === totalPage || totalPage === 0}
            className="px-3 py-2 cursor-pointer flex items-center justify-center rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;

