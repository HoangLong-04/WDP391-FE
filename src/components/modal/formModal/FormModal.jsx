import React from "react";
import BaseModal from "../baseModal/BaseModal";

function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  isDelete,
  isSend,
  isCreate,
  isUpdate,
}) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="space-y-5 flex-1">{children}</div>

        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 mt-6 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 cursor-pointer border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2.5 cursor-pointer text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              isDelete 
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSend ? "Sending..." : isDelete ? "Deleting..." : isCreate ? "Creating..." : isUpdate ? "Updating..." : "Saving..."}
              </span>
            ) : (
              isSend ? "Send" : isDelete ? "Delete" : isCreate ? "Create" : isUpdate ? "Update" : "Save"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export default FormModal;
