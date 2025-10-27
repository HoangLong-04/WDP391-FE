import { useState } from "react";

export const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return "-";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {images.map((img, index) => (
          <img
            key={img.id}
            src={img.imageUrl}
            alt={`Motorbike ${index + 1}`}
            className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
            onClick={() => setSelectedImage(img.imageUrl)}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-75 z-50 flex items-start justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 right-0 cursor-pointer bg-black py-2 px-4 text-white text-2xl hover:text-gray-300 transition"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="w-full h-full object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
