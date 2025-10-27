export const motorGeneralFields = [
  { key: "id", label: "Id" },
  { key: "name", label: "Name" },
  { key: "model", label: "Model" },
  { key: "version", label: "Version" },
  { key: "makeFrom", label: "Made in" },
  { key: "description", label: "Description" },
  {
    key: "price",
    label: "Price",
    render: (price) => {
      if (price) {
        return price.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      }
      return "-";
    },
  },
  {
    key: "isDeleted",
    label: "Status",
    render: (isDeleted) => (
      <span
        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
          isDeleted ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {isDeleted ? "Unavailable" : "Available"}
      </span>
    ),
  },
];

export const motorGroupedFields = [
  {
    title: "APPEARANCE & DIMENSIONS",
    key: "appearance",
    fields: [
      {
        key: "appearance.length",
        label: "Length (mm)",
        render: (value) => (value ? `${value} mm` : "-"),
      },
      {
        key: "appearance.width",
        label: "Width (mm)",
        render: (value) => (value ? `${value} mm` : "-"),
      },
      {
        key: "appearance.height",
        label: "Height (mm)",
        render: (value) => (value ? `${value} mm` : "-"),
      },
      {
        key: "appearance.weight",
        label: "Weight (kg)",
        render: (value) => (value ? `${value} kg` : "-"),
      },
      {
        key: "appearance.undercarriageDistance",
        label: "Ground clearance (mm)",
        render: (value) => (value ? `${value} mm` : "-"),
      },
      {
        key: "appearance.storageLimit",
        label: "Storage capacity (L)",
        render: (value) => (value ? `${value} L` : "-"),
      },
    ],
  },

  {
    title: "BATTERY SPECIFICATIONS",
    key: "battery",
    fields: [
      { key: "battery.type", label: "Battery type" },
      { key: "battery.capacity", label: "Capacity" },
      { key: "battery.chargeTime", label: "Charge time" },
      { key: "battery.chargeType", label: "Charge type" },
      { key: "battery.energyConsumption", label: "Energy consumption" },
      { key: "battery.limit", label: "Max range" },
    ],
  },

  {
    title: "CONFIGURATION & SAFETY",
    key: "config_safe",
    fields: [
      { key: "configuration.motorType", label: "Motor type" },
      { key: "configuration.speedLimit", label: "Speed limit" },
      {
        key: "configuration.maximumCapacity",
        label: "Max capacity",
      },
      { key: "safeFeature.brake", label: "Brake" },
      { key: "safeFeature.lock", label: "Lock" },
    ],
  },

  {
    title: "MEDIA",
    key: "media",
    fields: [
      {
        key: "colors",
        label: "Available colors",
        render: (colors) => (
          <div className="flex flex-wrap gap-2 items-center">
            {colors && colors.length > 0 ? (
              colors.map((c, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 border rounded-md p-1 bg-gray-50"
                >
                  <span className="font-semibold capitalize text-gray-700">
                    {c.color.colorType}
                  </span>
                  <img
                    src={c.imageUrl}
                    alt={`${c.color.colorType} motorbike`}
                    className="w-10 h-10 object-cover rounded-md"
                  />
                </div>
              ))
            ) : (
              <span className="text-gray-500">- N/A -</span>
            )}
          </div>
        ),
      },
      {
        key: "images",
        label: "General images",
        render: (images) => (
          <div className="flex flex-wrap gap-2">
            {images && images.length > 0 ? (
              images.map((img, index) => (
                <img
                  key={index}
                  src={img.imageUrl}
                  alt={`Motorbike General Image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
              ))
            ) : (
              <span className="text-gray-500">- N/A -</span>
            )}
          </div>
        ),
      },
    ],
  },
];
