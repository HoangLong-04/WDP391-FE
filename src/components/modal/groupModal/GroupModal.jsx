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
    <div className="flex gap-5 py-2 border-b last:border-0" key={field.key}>
      <label className="font-semibold text-gray-700 w-1/3 min-w-[150px]">
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
  const [activeTab, setActiveTab] = useState(groupedFields?.[0]?.key);

  if (!groupedFields || groupedFields.length === 0) {
    return <p>No detail fields defined.</p>;
  }

  const fieldCallbacks = {
    colors: onDeleteColor,
  };
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="p-5 border rounded-xl bg-white shadow-sm">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 text-blue-700">
                GENERAL INFORMATION
              </h3>
              <div className="space-y-2">
                {generalFields.map((field) => renderField(field, data))}
              </div>
            </div>
            {/* Tabs */}
            {groupedFields && groupedFields.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {groupedFields.map((group) => (
                      <button
                        key={group.key}
                        onClick={() => setActiveTab(group.key)}
                        className={`px-3 py-1.5 rounded-full text-sm transition border ${
                          activeTab === group.key
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        {group.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  {groupedFields
                    .filter((g) => g.key === activeTab)
                    .map((group) => (
                      <div key={group.key} className="space-y-2">
                        {group.fields?.map((field) => {
                          const value = getNestedValue(data, field.key);
                          return (
                            <div className="flex gap-5 py-2 border-b last:border-0" key={field.key}>
                              <label className="font-semibold text-gray-700 w-1/3 min-w-[150px]">
                                {field.label}:
                              </label>
                              <p className="text-gray-900 w-2/3">
                                {field.render
                                  ? field.render(value, data, fieldCallbacks[field.key])
                                  : value !== null && value !== undefined
                                  ? value.toString()
                                  : "-"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

export default GroupModal;
