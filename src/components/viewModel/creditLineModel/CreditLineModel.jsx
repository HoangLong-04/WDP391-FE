export const creditGeneralField = [
  { key: "id", label: "Id" },
  { key: "creditLimit", label: "Limit" },
  {
    key: "currentDebt",
    label: "Current Debt",
    render: (data) => (data !== undefined && data !== null ? data.toLocaleString() + " đ" : "0 đ"),
  },
  { key: "warningThreshold", label: "Threshold" },
  { key: "overDueThreshHoldDays", label: "Over due days" },
  {
    key: "isBlocked",
    label: "Available",
    render: (data) => {
      const isAvailable = data !== true;
      return (
        <span className={`font-semibold ${isAvailable ? "text-green-600" : "text-red-600"}`}>
          {isAvailable ? "Yes" : "No"}
        </span>
      );
    },
  },
];

export const creditGroupField = [
  {
    title: "AGENCY INFO",
    key: "agency",
    fields: [
      {
        key: "agency.id",
        label: "Id",
      },
      {
        key: "agency.name",
        label: "Name",
      },
      {
        key: "agency.location",
        label: "Location",
      },
      {
        key: "agency.address",
        label: "Address",
      },
      {
        key: "agency.contactInfo",
        label: "Contact",
      },
      {
        key: "agency.status",
        label: "status",
      },
    ],
  },
];
