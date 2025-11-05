import dayjs from "dayjs";
import { renderStatusTag } from "../../../utils/statusTag";

// Function to format currency (assuming VND)
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "0";
  return amount.toLocaleString();
};

// Function to format date and time
const formatDate = (date) => {
  return date ? dayjs(date).format("DD/MM/YYYY") : "-";
};
export const generalFields = [
  { key: "orderId", label: "Order id" },
  {
    key: "orderSubtotal",
    label: "Order subtotal",
    render: formatCurrency,
  },
  {
    key: "orderItemQuantity",
    label: "Item quantity",
  },
  {
    key: "orderAt",
    label: "Order date",
    render: formatDate,
  },
  {
    key: "orderType",
    label: "Order type",
  },
  {
    key: "orderStatus",
    label: "Status",
    render: (status) => renderStatusTag(status),
  },
  {
    key: "creditChecked",
    label: "Credit checked",
    render: (checked) => (checked ? "Yes" : "No"),
  },
];

export const groupedFields = [
  // --- PRODUCT & QUANTITY INFORMATION ---
  {
    key: "product_info",
    title: "PRODUCT DETAILS",
    fields: [
      { label: "Motorbike Name", key: "electricMotorbike.name" }, // Nested object access
      { label: "Color", key: "color.colorType" },
      { label: "Quantity", key: "quantity", type: "number" },
    ],
  },

  // --- WAREHOUSE AND AGENCY INFORMATION ---
  {
    key: "location_info",
    title: "WAREHOUSE",
    fields: [
      { label: "Warehouse Name", key: "warehouse.name" },
      { label: "Warehouse Address", key: "warehouse.address" },
      { label: "Warehouse Location", key: "warehouse.location" },
    ],
  },

  // --- FINANCIAL DETAILS ---
  {
    key: "financial_info",
    title: "FINANCIAL DETAILS",
    fields: [
      { label: "Base Price", key: "basePrice", render: formatCurrency },
      {
        label: "Wholesale Price",
        key: "wholeSalePrice",
        render: formatCurrency,
      },
      {
        label: "Total Promotions",
        key: "promotionTotal",
        render: formatCurrency,
      },
      {
        label: "Total Discounts",
        key: "discountTotal",
        render: formatCurrency,
      },
      { label: "Final Price", key: "finalPrice", render: formatCurrency },
      { label: "Discount Policy", key: "discountPolicy.name" },
      { label: "Discount Type", key: "discountPolicy.type" },
      { label: "Discount Value", key: "discountPolicy.value", render: (value, data) => {
        const discountPolicy = data?.discountPolicy;
        if (!discountPolicy) return "-";
        const valueType = discountPolicy.valueType || discountPolicy.value_type;
        if (valueType === "PERCENT") {
          return `${value}%`;
        }
        return formatCurrency(value);
      }},
      { label: "Promotion", key: "promotion.name" },
      { label: "Promotion Value", key: "promotion.value", render: (value, data) => {
        const promotion = data?.promotion;
        if (!promotion) return "-";
        const valueType = promotion.valueType || promotion.value_type;
        if (valueType === "PERCENT") {
          return `${value}%`;
        }
        return formatCurrency(value);
      }},
    ],
  },
  {
    key: "agency_bill",
    title: "AGENCY BILL",
    fields: [
      { label: "Amount", key: "agencyBill.amount", render: formatCurrency },
      {
        label: "Create date",
        key: "agencyBill.createAt",
        render: formatDate,
      },
      {
        label: "Complete",
        key: "agencyBill.isCompleted",
        render: (isComplete) => {
          return isComplete ? "Yes" : "No";
        },
      },
      {
        label: "Type",
        key: "agencyBill.type",
      },
    ],
  },
];
