import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaff from "../../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import DataTable from "../../../../components/dataTable/DataTable";
import dayjs from "dayjs";
import FormModal from "../../../../components/modal/formModal/FormModal";
import BookForm from "./bookForm/BookForm";
import { Pencil, Plus } from "lucide-react";

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

  const [selectedId, setSelectedId] = useState("");

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
      setBookList(response.data.data);
      setTotalItem(response.data.paginationInfo.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId, page, limit, fullname, phone, email]);

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

  const handleViewDetail = (item) => {
    // Can add view detail modal if needed
  };

  const columns = [
    { key: "id", title: "Id" },
    { key: "fullname", title: "Fullname" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { 
      key: "driveDate", 
      title: "Date",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    { key: "driveTime", title: "Time" },
    { key: "status", title: "Status" },
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
    </div>
  );
}

export default BookingManagement;
