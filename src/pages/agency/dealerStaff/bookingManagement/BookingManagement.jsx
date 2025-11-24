import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaff from "../../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import DataTable from "../../../../components/dataTable/DataTable";
import dayjs from "dayjs";
import FormModal from "../../../../components/modal/formModal/FormModal";
import BaseModal from "../../../../components/modal/baseModal/BaseModal";
import CircularProgress from "@mui/material/CircularProgress";
import BookForm from "./bookForm/BookForm";
import { Pencil, Plus, Eye } from "lucide-react";
import { renderStatusTag } from "../../../../utils/statusTag";

function BookingManagement() {
  const { user } = useAuth();
  const [bookList, setBookList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItem, setTotalItem] = useState(0);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [formModal, setFormModal] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    driveDate: "",
    driveTime: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  const [selectedId, setSelectedId] = useState("");
  
  // Map to store motorbike names by booking ID
  const [motorbikeNames, setMotorbikeNames] = useState({});

  const fetchBookList = useCallback(async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      const response = await PrivateDealerStaff.getBookingList(user.agencyId, {
        page,
        limit,
        fullname,
        phone,
        email,
      });
      const bookings = response.data.data || [];
      setBookList(bookings);
      setTotalItem(response.data.paginationInfo.total);
      
      // Fetch details for all bookings to get motorbike names
      if (bookings.length > 0) {
        fetchBookingDetails(bookings);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId, page, limit, fullname, phone, email]);

  // Fetch details for all bookings to get motorbike names
  const fetchBookingDetails = async (bookings) => {
    try {
      // Fetch all details in parallel
      const detailPromises = bookings.map((booking) =>
        PrivateDealerStaff.getBookingDetail(booking.id)
          .then((response) => ({
            bookingId: booking.id,
            detail: response.data?.data || null,
          }))
          .catch((error) => {
            console.error(`Failed to fetch detail for booking ${booking.id}:`, error);
            return { bookingId: booking.id, detail: null };
          })
      );

      const details = await Promise.all(detailPromises);
      
      // Update motorbike names state
      const newMotorbikeNames = {};
      details.forEach(({ bookingId, detail }) => {
        if (detail?.electricMotorbike?.name) {
          newMotorbikeNames[bookingId] = detail.electricMotorbike.name;
        }
      });
      
      setMotorbikeNames((prev) => ({
        ...prev,
        ...newMotorbikeNames,
      }));
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  };

  useEffect(() => {
    fetchBookList();
  }, [fetchBookList]);

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setSubmit(true);
    let formattedDriveTime = form.driveTime;
    if (form.driveTime && form.driveTime.length <= 5) {
      formattedDriveTime = `${form.driveTime}:00`;
    }
    const sendData = {
        ...form,
        driveTime: formattedDriveTime
    }
    try {
      await PrivateDealerStaff.updateBooking(selectedId, sendData);
      toast.success("Update success");
      setFormModal(false);
      fetchBookList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  const handleViewDetail = async (item) => {
    setSelectedId(item.id);
    setViewModalLoading(true);
    setViewModal(true);
    try {
      const response = await PrivateDealerStaff.getBookingDetail(item.id);
      const detail = response.data?.data || null;
      setBookingDetail(detail);
      
      // Store motorbike name for this booking
      if (detail?.electricMotorbike?.name) {
        setMotorbikeNames((prev) => ({
          ...prev,
          [item.id]: detail.electricMotorbike.name,
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch booking detail");
      setViewModal(false);
    } finally {
      setViewModalLoading(false);
    }
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "fullname", title: "Fullname" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    {
      key: "motorbikeName",
      title: "Motorbike",
      render: (_, item) => (
        <span className="font-medium">
          {motorbikeNames[item.id] || "-"}
        </span>
      ),
    },
    { 
      key: "driveDate", 
      title: "Date",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    { key: "driveTime", title: "Time" },
    { 
      key: "status", 
      title: "Status",
      render: (status) => renderStatusTag(status),
    },
  ];

  const actions = [
    {
      type: "edit",
      label: "Update",
      icon: Pencil,
      onClick: (item) => {
        setFormModal(true);
        setSelectedId(item.id);
        setForm({
          ...item,
          driveDate: item.driveDate ? dayjs(item.driveDate).format("YYYY-MM-DD") : "",
        });
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-end gap-5 my-3 items-center">
        <div>
          <label className="mr-2 font-medium text-gray-600">Fullname:</label>
          <input
            placeholder="Fullname"
            value={fullname}
            onChange={(e) => {
              setFullname(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="text"
          />
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Phone:</label>
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="tel"
          />
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-600">Email:</label>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
            type="email"
          />
        </div>
      </div>
      <DataTable
        title="Booking Management"
        columns={columns}
        data={bookList}
        loading={loading}
        page={page}
        setPage={setPage}
        totalItem={totalItem}
        limit={limit}
        onRowClick={handleViewDetail}
        actions={actions}
      />
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={"Update booking"}
        isDelete={false}
        onSubmit={handleUpdateBooking}
        isSubmitting={submit}
      >
        <BookForm form={form} setForm={setForm} />
      </FormModal>

      {/* View Detail Modal */}
      <BaseModal
        isOpen={viewModal}
        onClose={() => {
          setViewModal(false);
          setBookingDetail(null);
        }}
        title="Booking Detail"
        size="lg"
      >
        {viewModalLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        ) : bookingDetail ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-teal-200 text-teal-700">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fullname</p>
                  <p className="font-semibold">{bookingDetail.fullname || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{bookingDetail.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{bookingDetail.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">
                    {renderStatusTag(bookingDetail.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-blue-200 text-blue-700">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Drive Date</p>
                  <p className="font-semibold">
                    {bookingDetail.driveDate
                      ? dayjs(bookingDetail.driveDate).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Drive Time</p>
                  <p className="font-semibold">{bookingDetail.driveTime || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-semibold">#{bookingDetail.id}</p>
                </div>
              </div>
            </div>

            {/* Motorbike Info */}
            {bookingDetail.electricMotorbike && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Motorbike Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">
                      {bookingDetail.electricMotorbike.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-semibold">
                      {bookingDetail.electricMotorbike.model || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Made From</p>
                    <p className="font-semibold">
                      {bookingDetail.electricMotorbike.makeFrom || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Version</p>
                    <p className="font-semibold">
                      {bookingDetail.electricMotorbike.version || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No booking detail available
          </div>
        )}
      </BaseModal>
    </div>
  );
}

export default BookingManagement;
