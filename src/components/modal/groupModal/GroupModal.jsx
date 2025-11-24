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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold mb-4 border-b border-blue-200 pb-2 text-blue-700">
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
                    {groupedFields.map((group, index) => {
                      const colorClasses = [
                        "bg-green-600 text-white border-green-600",
                        "bg-purple-600 text-white border-purple-600",
                        "bg-teal-600 text-white border-teal-600",
                        "bg-orange-600 text-white border-orange-600",
                        "bg-pink-600 text-white border-pink-600",
                        "bg-cyan-600 text-white border-cyan-600",
                      ];
                      const activeColor = colorClasses[index % colorClasses.length];
                      return (
                        <button
                          key={group.key}
                          onClick={() => setActiveTab(group.key)}
                          className={`px-3 py-1.5 rounded-full text-sm transition border ${
                            activeTab === group.key
                              ? activeColor
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                          }`}
                        >
                          {group.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-5">
                  {groupedFields
                    .filter((g) => g.key === activeTab)
                    .map((group, index) => {
                      const colorSchemes = [
                        { bg: "from-green-50 to-emerald-50", border: "border-green-100", title: "border-green-200", text: "text-green-700" },
                        { bg: "from-purple-50 to-pink-50", border: "border-purple-100", title: "border-purple-200", text: "text-purple-700" },
                        { bg: "from-teal-50 to-cyan-50", border: "border-teal-100", title: "border-teal-200", text: "text-teal-700" },
                        { bg: "from-orange-50 to-amber-50", border: "border-orange-100", title: "border-orange-200", text: "text-orange-700" },
                        { bg: "from-pink-50 to-rose-50", border: "border-pink-100", title: "border-pink-200", text: "text-pink-700" },
                        { bg: "from-cyan-50 to-sky-50", border: "border-cyan-100", title: "border-cyan-200", text: "text-cyan-700" },
                      ];
                      const colors = colorSchemes[index % colorSchemes.length];
                      return (
                        <div key={group.key} className={`bg-gradient-to-r ${colors.bg} rounded-lg p-5 border ${colors.border} shadow-sm`}>
                          <h4 className={`text-lg font-semibold mb-4 border-b ${colors.title} pb-2 ${colors.text}`}>
                            {group.title}
                          </h4>
                          <div className="space-y-2">
                            {group.fields?.map((field) => {
                              const value = getNestedValue(data, field.key);
                              return (
                                <div className="flex gap-5 py-2 border-b border-gray-200 last:border-0" key={field.key}>
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
                        </div>
                      );
                    })}
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
