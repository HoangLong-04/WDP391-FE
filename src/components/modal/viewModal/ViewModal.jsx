import React from "react";
import BaseModal from "../baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";

function ViewModal({ isOpen, onClose, title, data, fields, loading }) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center"><CircularProgress /></div>
          
        ) : (
          fields.map((field) => (
            <div className="flex gap-5" key={field.key}>
              <label className="font-bold text-gray-700">{field.label}:</label>
              <p className="text-gray-900">
                {field.render
                  ? field.render(data?.[field.key])
                  : data?.[field.key] || "-"}
              </p>
            </div>
          ))
        )}
      </div>
    </BaseModal>
  );
}

export default ViewModal;
