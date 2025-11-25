import React from "react";
import { X, Upload, Trash2, Loader2 } from "lucide-react";

function ContractForm({
  form,
  setForm,
  isEdit,
  customerList,
  staffList,
  motorbikeList,
  colorList,
  updateForm,
  setUpdateForm,
  user,
  contractStatus,
  documentType,
  setDocumentType,
  documentImages,
  setDocumentImages,
  uploadedDocuments,
  uploadingDocuments,
  deletingDocumentId,
  onUploadDocuments,
  onDeleteDocument,
  onViewImage,
}) {
  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400";
  const selectClasses = `${inputClasses} bg-white cursor-pointer appearance-none`;

  const currentForm = isEdit ? updateForm : form;
  
  // Debug: Check conditions for document upload
  const isDealerStaff = user?.roles?.includes("Dealer Staff") || user?.role?.[0] === "Dealer Staff";
  const shouldShowDocuments = isEdit && isDealerStaff && contractStatus === "CONFIRMED";
  
  // Debug log (remove in production)
  if (isEdit) {
    console.log("Document Upload Conditions:", {
      isEdit,
      isDealerStaff,
      contractStatus,
      userRoles: user?.roles,
      userRole: user?.role,
      shouldShowDocuments
    });
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (type === "number") {
      processedValue = value ? Number(value) : 0;
    }

    if (processedValue === "") {
      processedValue = null;
    }

    {
      isEdit
        ? setUpdateForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }))
        : setForm((prevData) => ({
            ...prevData,
            [name]: processedValue,
          }));
    }
  };
  return (
    <div className="space-y-3">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={currentForm.title}
          onChange={handleChange}
          className={inputClasses}
          placeholder="e.g., Contract for Model X - Agency 1"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Content
        </label>
        <textarea
          name="content"
          value={currentForm.content}
          onChange={handleChange}
          className={`${inputClasses} h-24 resize-none`}
          placeholder="Detailed content or notes for the contract."
        />
      </div>

      {isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sign Date
          </label>
          <input
            type="date"
            name="signDate"
            value={currentForm.signDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Delivery Date
        </label>
        <input
          type="date"
          name="deliveryDate"
          value={currentForm.deliveryDate}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="finalPrice"
            value={currentForm.finalPrice || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Total value of the contract"
            min={1}
            required
          />
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deposit Amount
          </label>
          <input
            type="number"
            name="depositAmount"
            value={currentForm.depositAmount || 0}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Amount deposited by the customer"
            min={0}
          />
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Payment Type {!isEdit && <span className="text-red-500">*</span>}
        </label>
        <select
          name="contractPaidType"
          value={currentForm.contractPaidType || ""}
          onChange={handleChange}
          className={selectClasses}
          required={!isEdit}
          disabled={isEdit}
        >
          <option value="">-- Select Payment Type --</option>
          <option value="FULL">FULL</option>
          <option value="DEBT">DEBT</option>
        </select>
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={currentForm.status || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Status --</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="customerId"
            value={form.customerId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Customer --</option>
            {customerList.map((customer) => (
              <option value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Staff/Sales Person <span className="text-red-500">*</span>
          </label>
          <select
            name="staffId"
            value={form.staffId || ""}
            onChange={handleChange}
            className={selectClasses}
            required
          >
            <option value="">-- Select Staff --</option>
            {staffList.map((staff) => (
              <option value={staff.id}>{staff.fullname}</option>
            ))}
          </select>
        </div>
      )}

      {!isEdit && (
        <>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Electric Motorbike <span className="text-red-500">*</span>
            </label>
            <select
              name="electricMotorbikeId"
              value={currentForm.electricMotorbikeId || ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="">-- Select Motorbike --</option>
              {motorbikeList.map((motor) => (
                <option value={motor.id}>
                  {motor.name} - {motor.model}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color <span className="text-red-500">*</span>
            </label>
            <select
              name="colorId"
              value={currentForm.colorId || ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="">-- Select Color --</option>
              {colorList.map((color) => (
                <option value={color.id}>{color.colorType}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Document Upload Section - Only for Dealer Staff in Edit Mode when status is CONFIRMED */}
      {shouldShowDocuments && (
        <div className="group border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Upload</h3>
          
          {/* Document Type Select */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={selectClasses}
            >
              <option value="">-- Select Document Type --</option>
              <option value="ID Card">ID Card</option>
              <option value="Passport">Passport</option>
              <option value="Drive License">Drive License</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Images <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setDocumentImages(files);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
            />
            {documentImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {documentImages.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md text-sm"
                  >
                    <span className="text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentImages(documentImages.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={onUploadDocuments}
            disabled={!documentType || documentImages.length === 0 || uploadingDocuments}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploadingDocuments ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload Documents</span>
              </>
            )}
          </button>

          {/* Uploaded Documents List */}
          {uploadedDocuments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
              <div className="space-y-3">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={doc.imageUrl}
                        alt={doc.documentType || "Document"}
                        className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onViewImage && onViewImage(doc.imageUrl)}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64?text=Image";
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {doc.documentType || "Unknown Type"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Click image to view
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id, doc.imageUrl)}
                      disabled={deletingDocumentId === doc.id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete document"
                    >
                      {deletingDocumentId === doc.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContractForm;
