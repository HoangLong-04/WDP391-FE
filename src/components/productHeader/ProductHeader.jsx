import React from "react";

function ProductHeader() {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-2xl font-medium">MOTOBIKES</span>
        <div className="flex gap-5">
          <select
            className="bg-[rgb(242,246,255)] border-none pr-5 pl-2 rounded-lg"
            name=""
            id=""
          >
            <option value="">hello</option>
          </select>
          <select
            className="bg-[rgb(242,246,255)] border-none pr-5 pl-2 rounded-lg"
            name=""
            id=""
          >
            <option value="">hello</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductHeader;
