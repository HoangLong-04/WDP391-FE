import React from "react";
import BaseModal from "../baseModal/BaseModal";

function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      
      onClose={onClose}
      title={title}
      size="sm"
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-4">{children}</div>

        <div className="flex gap-2 justify-end pt-6 border-t mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 cursor-pointer border rounded hover:bg-gray-100 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export default FormModal;
