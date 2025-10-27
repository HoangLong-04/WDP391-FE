export const agencyField = [
    {key: 'id', label: 'Id'},
    {key: 'name', label: 'Name'},
    {key: 'location', label: 'Location'},
    {key: 'address', label: 'Address'},
    {key: 'contactInfo', label: 'Contact'},
    {key: 'isActive', label: 'Active', render: (isActive) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            isActive ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ), },
]