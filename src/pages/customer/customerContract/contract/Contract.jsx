import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";

function Contract({
  title,
  content,
  totalAmount,
  depositAmount,
  createAt,
  contractType,
  type,
  status,
  customerId,
  staffId,
  agencyId,
  motorbikeId,
  colorId,
  quotation,
  installmentContract,
  contractDocuments,
  onViewDetail,
  onOpen,
  loading,
}) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "PENDING"
              ? "bg-yellow-100 text-yellow-700"
              : status === "ACCEPTED"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <Info label="Customer ID" value={customerId} />
        <Info label="Staff ID" value={staffId} />
        <Info label="Agency ID" value={agencyId} />
        <Info label="Motorbike ID" value={motorbikeId} />
        <Info label="Color ID" value={colorId} />
        <Info label="Created At" value={dayjs(createAt).format("DD/MM/YYYY")} />
        <Info label="Contract Type" value={contractType} />
        <Info label="Type" value={type} />
        <Info
          label="Deposit"
          value={`${depositAmount?.toLocaleString()} VND`}
        />
        <Info
          label="Total Amount"
          value={`${totalAmount?.toLocaleString()} VND`}
        />
      </div>

      {/* Nội dung mô tả */}
      {content && (
        <div className="pt-3 border-t">
          <p className="text-gray-600 text-sm">{content}</p>
        </div>
      )}

      {/* Quotation Section */}
      {quotation && (
        <Section title="Quotation">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <Info label="Status" value={quotation.status} />
            <Info label="Type" value={quotation.type} />
            <Info
              label="Base Price"
              value={`${quotation.basePrice?.toLocaleString()} VND`}
            />
            <Info
              label="Promotion Price"
              value={`${quotation.promotionPrice?.toLocaleString()} VND`}
            />
            <Info
              label="Final Price"
              value={`${quotation.finalPrice?.toLocaleString()} VND`}
            />
            <Info
              label="Valid Until"
              value={dayjs(quotation.validUntil).format("DD/MM/YYYY")}
            />
          </div>
        </Section>
      )}

      {/* Installment Section */}
      {installmentContract && (
        <Section title="Installment Contract">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <Info
              label="Start Date"
              value={dayjs(installmentContract.startDate).format("DD/MM/YYYY")}
            />
            <Info
              label="Penalty Value"
              value={`${installmentContract.penaltyValue?.toLocaleString()} VND`}
            />
            <Info
              label="Penalty Type"
              value={installmentContract.penaltyType}
            />
            <Info
              label="Prepaid Total"
              value={`${installmentContract.prePaidTotal?.toLocaleString()} VND`}
            />
            <Info
              label="Total Debt Paid"
              value={`${installmentContract.totalDebtPaid?.toLocaleString()} VND`}
            />
            <Info label="Status" value={installmentContract.status} />
            {/* <Info label="Contract id" value={installmentContract.id} /> */}
            <div>
              <button
                disabled={loading} // vô hiệu hóa khi đang load
                onClick={async () => {
                  try {
                    await onViewDetail();
                    onOpen();
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className={`flex cursor-pointer items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition 
      ${
        loading
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
              >
                {loading ? (
                  <>
                    <CircularProgress size={18} color="inherit" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Get contract detail"
                )}
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* Documents */}
      {contractDocuments?.length > 0 && (
        <Section title="Attached Documents">
          <div className="flex flex-wrap gap-3">
            {contractDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-2 bg-gray-50 text-sm flex items-center gap-2"
              >
                <img
                  src={doc.imageUrl}
                  alt={doc.documentType}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{doc.documentType}</p>
                  <a
                    href={doc.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-medium text-gray-800">{value ?? "-"}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="pt-4 border-t">
    <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
    {children}
  </div>
);

export default Contract;
