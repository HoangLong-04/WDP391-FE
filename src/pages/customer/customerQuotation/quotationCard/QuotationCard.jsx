import dayjs from "dayjs";
import {
  BadgeCheck,
  Clock,
  Store,
  Tag,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";

function QuotationCard({ quotation, onViewDetail }) {
  if (!quotation) return null;

  const {
    quoteCode,
    createDate,
    type,
    status,
    basePrice,
    promotionPrice,
    finalPrice,
    validUntil,
    customerId,
    dealerStaffId,
    motorbikeId,
    colorId,
    agencyId,
    
  } = quotation;

  const formatCurrency = (value) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const statusColor =
    status === "ACCEPTED"
      ? "bg-green-100 text-green-800"
      : status === "PENDING"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          Quotation Code: <span className="text-blue-600">{quoteCode}</span>
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor}`}
        >
          {status}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Created: {dayjs(createDate).format("DD/MM/YYYY")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Valid until: {dayjs(validUntil).format("DD/MM/YYYY")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-500" />
          <span>Type: {type}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span>Customer ID: {customerId}</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-blue-500" />
          <span>Dealer Staff: {dealerStaffId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-500" />
          <span>Motorbike ID: {motorbikeId}</span>
        </div>
      </div>

      {/* Price Section */}
      <div className="mt-5 border-t pt-4">
        <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Pricing Details
        </h3>
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-sm text-gray-500">Base Price</p>
            <p className="font-medium text-gray-800">
              {formatCurrency(basePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Promotion</p>
            <p className="font-medium text-red-600">
              -{formatCurrency(promotionPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Final Price</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(finalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <button onClick={onViewDetail} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
          Get deposit
        </button>
      </div>
    </div>
  );
}

export default QuotationCard;
