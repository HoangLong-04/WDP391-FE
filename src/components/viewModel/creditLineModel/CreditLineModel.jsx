import { Check, X } from "lucide-react";

export const creditGeneralField = [
  { key: "id", label: "Id" },
  { key: "creditLimit", label: "Limit" },
  { key: "warningThreshold", label: "Threshold" },
  { key: "overDueThreshHoldDays", label: "Over due days" },
  {
    key: "isBlocked",
    label: "Available",
    render: (data) => (data === true ? <X /> : <Check />),
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
