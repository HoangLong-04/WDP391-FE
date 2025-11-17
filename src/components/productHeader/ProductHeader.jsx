import React from "react";

function ProductHeader({
  modelList,
  makeList,
  model,
  setModel,
  makeFrom,
  setMakeFrom,
  setPage,
  sort,
  setSort,
}) {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-3xl font-medium">MOTOBIKES</span>
        <div className="flex items-center gap-5">
          <div className="flex gap-2 items-center">
            <label>Model</label>
            <select
              className="bg-[rgb(242,246,255)] border-none py-2 px-5 rounded-lg"
              name="model"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {modelList?.map((m) => (
                <option value={m.model}>{m.model}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label>Made in</label>

            <select
              className="bg-[rgb(242,246,255)] border-none py-2 px-5 rounded-lg"
              value={makeFrom}
              onChange={(e) => {
                setMakeFrom(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {makeList?.map((m) => (
                <option value={m.makeFrom}>{m.makeFrom}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label>Sort</label>
            <select
              className="bg-[rgb(242,246,255)] border-none py-2 px-5 rounded-lg"
              name="sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductHeader;
