import dayjs from "dayjs";
import { ImageGallery } from "./viewImage/ViewImage";

export const stockGeneralFields = [
  {
    key: "id",
    label: "Stock ID",
  },
  {
    key: "quantity",
    label: "Quantity",
    render: (value) => value?.toLocaleString() || "-",
  },
  {
    key: "price",
    label: "Price",
    render: (value) => value ? `${value.toLocaleString()} VND` : "-",
  },
  {
    key: "createAt",
    label: "Created At",
    render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : "-",
  },
  {
    key: "updateAt",
    label: "Updated At",
    render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : "-",
  },
  {
    key: "agencyId",
    label: "Agency ID",
  },
  {
    key: "motorbikeId",
    label: "Motorbike ID",
  },
  {
    key: "colorId",
    label: "Color ID",
  },
];



export const stockGroupedFields = [
  {
    key: "motorbike",
    title: "MOTORBIKE INFORMATION",
    fields: [
      {
        key: "motorbike.id",
        label: "Motorbike ID",
      },
      {
        key: "motorbike.name",
        label: "Name",
      },
      {
        key: "motorbike.model",
        label: "Model",
      },
      {
        key: "motorbike.version",
        label: "Version",
      },
      {
        key: "motorbike.price",
        label: "Base Price",
        render: (value) => value ? `${value.toLocaleString()} $` : "-",
      },
      {
        key: "motorbike.makeFrom",
        label: "Made In",
      },
      {
        key: "motorbike.images",
        label: "Images",
        render: (images) => <ImageGallery images={images} />
      },
    ],
  },
  {
    key: "color",
    title: "COLOR INFORMATION",
    fields: [
      {
        key: "color.id",
        label: "Color ID",
      },
      {
        key: "color.colorType",
        label: "Color Type",
        render: (value) => (
          <span className="capitalize">{value || "-"}</span>
        ),
      },
    ],
  },
  {
    key: "promotions",
    title: "ACTIVE PROMOTIONS",
    fields: [
      {
        key: "agencyStockPromotion",
        label: "Promotions",
        render: (promotions) => {
          if (!promotions || promotions.length === 0) {
            return <span className="text-gray-500 italic">No active promotions</span>;
          }
          return (
            <div className="space-y-3">
              {promotions.map((item, index) => {
                const promo = item.stockPromotion;
                return (
                  <div key={promo.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded">
                    <p className="font-semibold text-blue-700">{promo.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Discount:</span>{" "}
                        {promo.valueType === "PERCENT" 
                          ? `${promo.value}%` 
                          : `${promo.value.toLocaleString()} VND`}
                      </p>
                      <p>
                        <span className="font-medium">Period:</span>{" "}
                        {new Date(promo.startAt).toLocaleDateString('vi-VN')} - {new Date(promo.endAt).toLocaleDateString('vi-VN')}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <span className={`px-2 py-1 rounded text-xs ${
                          promo.status === "ACTIVE" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {promo.status}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    ],
  },
];
