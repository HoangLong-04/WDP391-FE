import React, { useState } from "react";
import BaseModal from "../baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  return path
    .split(".")
    .reduce(
      (currentObj, key) =>
        currentObj && currentObj[key] !== undefined ? currentObj[key] : null,
      obj
    );
};

const renderField = (field, data, extraCallbacks = {}) => {
  const value = getNestedValue(data, field.key);

  return (
    <div className="flex gap-5" key={field.key}>
      <label className="font-bold text-gray-700 w-1/3 min-w-[150px]">
        {field.label}:
      </label>
      <p className="text-gray-900 w-2/3">
        {field.render
          ? field.render(value, data, extraCallbacks[field.key])
          : value !== null && value !== undefined
          ? value.toString()
          : "-"}
      </p>
    </div>
  );
};
function GroupModal({
  isOpen,
  onClose,
  title,
  data,
  groupedFields,
  loading,
  generalFields,
  onDeleteColor,
}) {
  const [openGroup, setOpenGroup] = useState(groupedFields?.[0]?.key);

  const toggleGroup = (key) => {
    setOpenGroup(openGroup === key ? null : key);
  };

  if (!groupedFields || groupedFields.length === 0) {
    return <p>No detail fields defined.</p>;
  }

  const fieldCallbacks = {
    colors: onDeleteColor, // ← Map callback cho colors field
  };
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 text-blue-700">
                GENERAL INFORMATION
              </h3>
              <div className="space-y-3">
                {generalFields.map((field) => renderField(field, data))}
              </div>
            </div>
            {groupedFields?.map((group) => (
              <div
                key={group.key}
                className="border border-gray-200 rounded-lg"
              >
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full p-4 text-left cursor-pointer font-bold text-lg flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition rounded-t-lg"
                >
                  {group.title}
                  <span className="text-xl">
                    {openGroup === group.key ? "▲" : "▼"}
                  </span>
                </button>

                {openGroup === group.key && (
                  <div className="p-4 bg-white space-y-3">
                    {group.fields?.map((field) => {
                      const value = getNestedValue(data, field.key);

                      return (
                        <div className="flex gap-5" key={field.key}>
                          <label className="font-bold text-gray-700 w-1/3 min-w-[150px]">
                            {field.label}:
                          </label>
                          <p className="text-gray-900 w-2/3">
                            {field.render
                              ? field.render(value, data, fieldCallbacks[field.key]) // Dùng render nếu có
                              : value !== null && value !== undefined
                              ? value.toString()
                              : "-"}{" "}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </BaseModal>
  );
}

export default GroupModal;
