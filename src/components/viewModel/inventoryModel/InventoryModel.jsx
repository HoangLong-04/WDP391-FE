import dayjs from "dayjs";

export const inventoryGroupFields = [
  {
    title: "WAREHOUSE",
    key: "warehouse",
    fields: [
      { key: "warehouse.id", label: "Id" },
      { key: "warehouse.location", label: "Location" },
      {
        key: "warehouse.address",
        label: "Address",
      },
      { key: "warehouse.name", label: "Name" },
      {
        key: "warehouse.isActive",
        label: "Active",
        render: (isActive) => (
          <span
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
  },
  {
    title: "MOTORBIKE",
    key: "motorbike",
    fields: [
      { key: "motorbike.id", label: "Id" },
      { key: "motorbike.name", label: "Name" },
      {
        key: "motorbike.price",
        label: "Price",
        render: (price) => price.toLocaleString() + ' đ'
      },
      { key: "motorbike.description", label: "Description" },
      { key: "motorbike.model", label: "Model" },
      { key: "motorbike.makeFrom", label: "Made in" },
      { key: "motorbike.version", label: "Version" },
    ],
  },
];

export const inventoryGeneralFields = [
  { key: "quantity", label: "Quantity" },
  {
    key: "stockDate",
    label: "Stock date",
    render: (stockDate) => dayjs(stockDate).format("DD/MM/YYYY"),
  },
  {
    key: "lastUpdate",
    label: "Last update",
    render: (lastUpdate) => dayjs(lastUpdate).format("DD/MM/YYYY"),
  },
  { key: "color", label: "Color" },
];
