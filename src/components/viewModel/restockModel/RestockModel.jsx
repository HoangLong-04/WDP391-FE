import dayjs from "dayjs";

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
  { key: "id", label: "Order id" },
  {
    key: "wholesalePrice",
    label: "Total amount",
    render: formatCurrency,
  },
  { key: "finalPrice", label: "Final price", render: formatCurrency },
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
        key: "wholesalePrice",
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
      { label: "Subtotal", key: "subtotal", render: formatCurrency },
      { label: "Discount", key: "discountPolicy.name" },
      { label: "Promotion", key: "promotion.name" },
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
