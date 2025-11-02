import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaff from "../../../../services/PrivateDealerStaffApi";
import { toast } from "react-toastify";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import FormModal from "../../../../components/modal/formModal/FormModal";
import BookForm from "./bookForm/BookForm";

function BookingManagement() {
  const { user } = useAuth();
  const [bookList, setBookList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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

  const fetchBookList = async () => {
    setLoading(true);
    try {
      const response = await PrivateDealerStaff.getBookingList(user?.agencyId, {
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
  };

  useEffect(() => {
    fetchBookList();
  }, [page, limit, fullname, phone, email]);

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

  const columns = [
    { key: "id", title: "Id" },
    { key: "fullname", title: "Fullname" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "driveDate", title: "Date" },
    { key: "driveTime", title: "Time" },
    { key: "status", title: "Status" },
    {
      key: "action1",
      title: "Update",
      render: (_, item) => (
        <span
          onClick={() => {
            setFormModal(true);
            setSelectedId(item.id);
            setForm({
              ...item,
              driveDate: dayjs(item.driveDate).format("YYYY-MM-DD"),
            });
          }}
          className="bg-blue-500 cursor-pointer p-2 rounded-lg text-white"
        >
          Update
        </span>
      ),
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
      <PaginationTable
        columns={columns}
        data={bookList}
        loading={loading}
        page={page}
        pageSize={limit}
        setPage={setPage}
        title={"Booking list"}
        totalItem={totalItem}
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
