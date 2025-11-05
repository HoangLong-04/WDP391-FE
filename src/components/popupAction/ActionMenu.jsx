import { useState } from "react";
import {
  Eye,
  Plus,
  MoreHorizontal,
  Settings,
  PaintBucket,
  Battery,
  ShieldCheck,
} from "lucide-react";

export default function ActionMenu({ onView, onAdd, title }) {
  const [open, setOpen] = useState(false);

  const getMainIcon = () => {
    switch (title?.toLowerCase()) {
      case "configuration":
      case "config":
        return <Settings className="w-5 h-5 text-gray-700" />;
      case "appearance":
      case "appear":
        return <PaintBucket className="w-5 h-5 text-gray-700" />;
      case "battery":
        return <Battery className="w-5 h-5 text-gray-700" />;
      case "safe feature":
      case "safe":
        return <ShieldCheck className="w-5 h-5 text-gray-700" />;
      default:
        return <MoreHorizontal className="w-5 h-5 text-gray-700" />;
    }
  };

  return (
    <div className="relative flex justify-center">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
      >
        {getMainIcon()}
      </button>

      {open && (
        <div
          className="absolute z-10 top-full mt-2 bg-white rounded-xl shadow-lg p-2 flex gap-2"
          onMouseLeave={() => setOpen(false)}
        >
          <span
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-gray-500 rounded-lg hover:bg-gray-600 transition"
          >
            <Eye className="w-5 h-5 text-white" />
          </span>
          <span
            onClick={() => {
              setOpen(false);
              onAdd();
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="w-5 h-5 text-white" />
          </span>
        </div>
      )}
    </div>
  );
}
