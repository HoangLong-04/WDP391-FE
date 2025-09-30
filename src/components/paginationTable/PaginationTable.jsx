import React, { useMemo } from 'react'

function PaginationTable({ title, columns, data, page, setPage }) {
  const pageSize = 8; // tối đa 8 item mỗi trang
  const totalPage = Math.ceil(data.length / pageSize);

  // lấy dữ liệu cho trang hiện tại
  const currentData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

      <div className="overflow-x-hidden h-[450px]">
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
            {currentData.map((item, idx) => (
              <tr
                key={item.id ?? idx}
                className="border-[rgb(181,183,192)] hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4">
        <div className="flex gap-2">
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
        </div>
      </div>
    </div>
  );
}

export default PaginationTable