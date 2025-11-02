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
  { key: "status", label: "Status" },
  {
    key: "wholesalePrice",
    label: "Total amount",
    render: formatCurrency,
  },
  { key: "finalPrice", label: "Final price", render: formatCurrency },
  { key: "orderAt", label: "Order date", render: formatDate },
];

export const groupedFields = [
  // --- PRODUCT & QUANTITY INFORMATION ---
  {
    key: "product_info",
    title: "PRODUCT DETAILS",
    fields: [
      { label: "Motorbike Name", key: "electricMotorbike.name" }, // Nested object access
      { label: "Motorbike ID", key: "electricMotorbikeId" },
      { label: "Color ID", key: "colorId" },
      { label: "Quantity", key: "quantity", type: "number" },
    ],
  },

  // --- WAREHOUSE AND AGENCY INFORMATION ---
  {
    key: "location_info",
    title: "WAREHOUSE AND AGENCY",
    fields: [
      { label: "Agency ID", key: "agencyId" },
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
      { label: "Price Policy ID", key: "pricePolicyId" },
      { label: "Promotion ID", key: "promotionId" },
      { label: "Discount ID", key: "discountId" },
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
