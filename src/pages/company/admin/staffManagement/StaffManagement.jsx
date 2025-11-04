import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../../services/PrivateAdminApi";
import CircularProgress from "@mui/material/CircularProgress";
import PaginationTable from "../../../../components/paginationTable/PaginationTable";
import dayjs from "dayjs";
import ViewModal from "../../../../components/modal/viewModal/ViewModal";
import FormModal from "../../../../components/modal/formModal/FormModal";
import { toast } from "react-toastify";
import StaffForm from "./staffForm/StaffForm";
import { Pencil, Trash2, Plus, NotebookPen, Building } from "lucide-react";

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [agency, setAgency] = useState({});
  const [roleList, setRoleList] = useState([]);
  const [agencyList, setAgencyList] = useState([]);
  const [availableAgencyList, setAvailableAgencyList] = useState([]);
  const [agenciesWithManager, setAgenciesWithManager] = useState(new Set());
  const [agencyId, setAgencyId] = useState(null);

  const [totalItem, setTotalItem] = useState(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [limit] = useState(5);

  const [loading, setLoading] = useState(false);
  const [formModalLoading, setFormModalLoading] = useState(false);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewModal, setViewModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [assignForm, setAssignForm] = useState(false);
  const [deleteForm, setDeleteForm] = useState(false);

  const [selectedId, setSelectedId] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
    role: [],
  });
  const [staffDetail, setStaffDetail] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await PrivateAdminApi.getRole();
        setRoleList(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchAgency = async () => {
      try {
        const response = await PrivateAdminApi.getAgency({ page, limit });
        setAgencyList(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAgency();
    fetchAllStaff();
    fetchRole();
  }, [page, limit, role]);

  // Fetch agency list để tính toán available agencies
  useEffect(() => {
    const fetchAgenciesForCheck = async () => {
      try {
        const response = await PrivateAdminApi.getAgency({ page: 1, limit: 100 });
        setAgencyList(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAgenciesForCheck();
  }, []);

  const fetchAllStaff = async () => {
    setLoading(true);
    try {
      // Fetch tất cả staff để filter và phân trang ở client-side
      let allStaff = [];
      let currentPage = 1;
      let hasMore = true;
      
      // Fetch tất cả các trang
      while (hasMore) {
        const response = await PrivateAdminApi.getAllStaff({
          page: currentPage,
          limit: 100, // Fetch nhiều items mỗi lần để giảm số request
          role,
        });
        
        const staffData = response.data.data;
        allStaff = [...allStaff, ...staffData];
        
        // Kiểm tra xem còn trang nào không
        const totalPages = Math.ceil(response.data.paginationInfo.total / 100);
        hasMore = currentPage < totalPages && staffData.length > 0;
        currentPage++;
        
        // Giới hạn tối đa 10 trang để tránh quá nhiều request
        if (currentPage > 10) break;
      }
      
      // Filter out deleted staff
      const filteredStaff = allStaff.filter(staff => !staff.isDeleted);
      
      // Tính toán agencies đã có Dealer Manager
      const agenciesWithManagerSet = new Set();
      filteredStaff.forEach(staff => {
        if (staff.agencyId) {
          let roleNames = [];
          if (Array.isArray(staff.roleNames)) {
            roleNames = staff.roleNames.map(role => {
              if (typeof role === 'string') return role;
              if (role && typeof role === 'object') return role.roleName || role.name || role;
              return String(role);
            });
          } else if (typeof staff.roleNames === 'string') {
            roleNames = staff.roleNames.split(',').map(r => r.trim()).filter(r => r);
          }
          
          const hasDealerManager = roleNames.some(r => 
            String(r).toLowerCase().trim() === "dealer manager"
          );
          
          if (hasDealerManager) {
            agenciesWithManagerSet.add(staff.agencyId);
          }
        }
      });
      setAgenciesWithManager(agenciesWithManagerSet);
      
      // Sắp xếp theo createAt giảm dần (mới nhất trước)
      const sortedStaff = filteredStaff.sort((a, b) => {
        const dateA = new Date(a.createAt || 0);
        const dateB = new Date(b.createAt || 0);
        return dateB - dateA; // Giảm dần: mới nhất trước
      });
      
      // Phân trang ở client-side
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStaff = sortedStaff.slice(startIndex, endIndex);
      
      setStaff(paginatedStaff);
      setTotalItem(sortedStaff.length);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.assignStaffToAgency(selectedId, agencyId);
      fetchAllStaff();
      setAssignForm(false);
      toast.success("Assign successfully");
    } catch (error) {
      toast.error(error.message || "Assign fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStaffById = async (id) => {
    setFormModalLoading(true);
    try {
      const response = await PrivateAdminApi.getStaffById(id);
      const data = response.data.data;
      setSelectedId(id);
      setIsEdit(true);
      setFormModal(true);
      setStaffDetail({
        username: data.username || "",
        fullname: data.fullname || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Get detail fail");
    } finally {
      setFormModalLoading(false);
    }
  };

  const handleDeleteStaff = async (e) => {
    e.preventDefault()
    setIsSubmitting(true);
    try {
      const response = await PrivateAdminApi.deleteStaff(selectedId);
      setIsDelete(false);
      setDeleteForm(false)
      fetchAllStaff();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.updateStaff(selectedId, {
        username: staffDetail.username,
        fullname: staffDetail.fullname,
        email: staffDetail.email,
        phone: staffDetail.phone,
        address: staffDetail.address,
      });
      fetchAllStaff();
      toast.success("Update successfully");
      setIsEdit(false);
      setFormModal(false);
      setStaffDetail({
        username: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Update fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAgencyById = async (id) => {
    setViewModalLoading(true);
    try {
      const response = await PrivateAdminApi.getAgencyById(id);
      setAgency(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PrivateAdminApi.createStaff(form);
      setForm({
        username: "",
        password: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
        role: [],
      });
      fetchAllStaff();
      setFormModal(false);

      toast.success("Create successfully");
    } catch (error) {
      console.log(error);
      toast.error("Create fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = (e) => {
    const selectedValue = parseInt(e.target.value);
    setForm({ ...form, role: selectedValue ? [selectedValue] : [] });
  };

  const columns = [
    { key: "id", title: "Id" },
    // { key: "avatar", title: "User name" },
    { key: "username", title: "User name" },
    { key: "fullname", title: "Full name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    { key: "address", title: "Address" },
    { key: "roleNames", title: "Roles" },
    {
      key: "isActive",
      title: "Status",
      render: (isActive) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            isActive ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      title: <span className="block text-center">Actions</span>,
      render: (_, item) => {
        // Check if staff is Dealer Manager and not yet assigned
        const allowedRole = "Dealer Manager";
        let roleNames = [];
        
        if (Array.isArray(item.roleNames)) {
          roleNames = item.roleNames.map(role => {
            if (typeof role === 'string') {
              return role;
            } else if (role && typeof role === 'object') {
              return role.roleName || role.name || role;
            }
            return String(role);
          });
        } else if (typeof item.roleNames === 'string') {
          roleNames = item.roleNames.split(',').map(r => r.trim()).filter(r => r);
        }
        
        const normalizedRoleNames = roleNames.map(r => String(r).toLowerCase().trim());
        const normalizedAllowed = allowedRole.toLowerCase().trim();
        const hasDealerManagerRole = normalizedRoleNames.includes(normalizedAllowed);
        const canAssign = !item.agencyId && hasDealerManagerRole;
        
        // Check xem còn agency nào available không
        const availableAgencies = agencyList.filter(agency => 
          !agenciesWithManager.has(agency.id)
        );
        const hasAvailableAgency = availableAgencies.length > 0;

        return (
          <div className="flex gap-2 justify-center items-center">
            {item.agencyId ? (
              <span
                onClick={() => {
                  setViewModal(true);
                  fetchAgencyById(item.agencyId);
                }}
                className="cursor-pointer bg-gray-500 rounded-lg flex justify-center items-center text-white hover:bg-gray-600 transition-colors w-10 h-10"
                title="View agency"
              >
                <Building className="w-5 h-5 text-white" />
              </span>
            ) : (
              <span className="w-10 h-10" />
            )}
            {canAssign ? (
              <span
                onClick={async () => {
                  if (!hasAvailableAgency) {
                    toast.warning("All agencies already have Dealer Manager assigned");
                    return;
                  }
                  
                  setSelectedId(item.id);
                  setAgencyId(null);
                  
                  // Set available agency list
                  setAvailableAgencyList(availableAgencies);
                  setAssignForm(true);
                }}
                className={`rounded-lg flex justify-center items-center text-white transition-colors w-10 h-10 ${
                  hasAvailableAgency
                    ? "cursor-pointer bg-green-500 hover:bg-green-600"
                    : "cursor-not-allowed bg-gray-400 opacity-50"
                }`}
                title={hasAvailableAgency ? "Assign to agency" : "No available agency"}
              >
                <NotebookPen className="w-5 h-5 text-white" />
              </span>
            ) : (
              <span className="w-10 h-10" />
            )}
            <span
              onClick={() => fetchStaffById(item.id)}
              className="cursor-pointer bg-blue-500 rounded-lg flex justify-center items-center text-white hover:bg-blue-600 transition-colors w-10 h-10"
              title="Update"
            >
              <Pencil className="w-5 h-5 text-white" />
            </span>
            <span
              onClick={() => {
                setIsDelete(true);
                setSelectedId(item.id);
                setDeleteForm(true);
              }}
              className="cursor-pointer bg-red-500 rounded-lg flex justify-center items-center text-white hover:bg-red-600 transition-colors w-10 h-10"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </span>
          </div>
        );
      },
    },
  ];

  const agencyFields = [
    { key: "id", label: "Id" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location" },
    { key: "address", label: "Address" },
    { key: "contactInfo", label: "Contact" },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            status ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status ? "Active" : "Not active"}
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="flex justify-end gap-10 items-center my-3">
        <div>
          <label className="mr-2 font-medium text-gray-600">Role:</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>

            {roleList
              .filter((r) => r.roleName !== "Customer")
              .map((r) => (
                <option key={r.id} value={r.roleName}>
                  {r.roleName}
                </option>
              ))}
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setFormModal(true);
              setIsEdit(false);
            }}
            className="cursor-pointer bg-blue-500 rounded-lg text-white p-2 hover:bg-blue-600 transition-colors flex items-center justify-center w-10 h-10"
            title="Create"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <PaginationTable
        data={staff}
        loading={loading}
        page={page}
        pageSize={limit}
        title={"Staff Management"}
        setPage={setPage}
        columns={columns}
        totalItem={totalItem}
      />

      <ViewModal
        data={agency}
        fields={agencyFields}
        onClose={() => setViewModal(false)}
        title={"Agency detail"}
        isOpen={viewModal}
        loading={viewModalLoading}
      />

      <FormModal
        isOpen={assignForm}
        onClose={() => {
          setAssignForm(false);
          setAgencyId(null);
          setAvailableAgencyList([]);
        }}
        title={"Assign staff to agency"}
        onSubmit={handleAssign}
        isSubmitting={isSubmitting}
      >
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Agency <span className="text-red-500">*</span>
          </label>
          <select
            value={agencyId}
            onChange={(e) => setAgencyId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer appearance-none"
            disabled={availableAgencyList.length === 0}
          >
            <option value="">
              {availableAgencyList.length === 0 
                ? "No available agency (all agencies have Dealer Manager)" 
                : "Select the agency"}
            </option>
            {availableAgencyList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} - {a.location}
              </option>
            ))}
          </select>
        </div>
      </FormModal>

      {formModalLoading ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CircularProgress sx={{ color: "white" }} />
        </div>
      ) : (
        <FormModal
          isOpen={formModal}
          onClose={() => setFormModal(false)}
          title={isEdit ? "Update staff" : "Create new staff"}
          onSubmit={isEdit ? updateStaff : handleCreateStaff}
          isSubmitting={isSubmitting}
          isCreate={!isEdit}
          isUpdate={isEdit}
        >
          <StaffForm
            isEdit={isEdit}
            form={form}
            roleList={roleList.filter(
              (r) => 
                r.roleName === "EVM Staff" || 
                r.roleName === "Evm Staff" ||
                r.roleName === "Dealer Manager"
            )}
            handleChangeRole={handleChangeRole}
            setForm={setForm}
            setStaffDetail={setStaffDetail}
            staffDetail={staffDetail}
          />
        </FormModal>
      )}

      <FormModal
        isOpen={deleteForm}
        onClose={() => setDeleteForm(false)}
        onSubmit={handleDeleteStaff}
        isSubmitting={isSubmitting}
        title={"Confirm delete"}
        isDelete={isDelete}
        
      >
        <p className="text-gray-700">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>
      </FormModal>
    </div>
  );
}

export default StaffManagement;
