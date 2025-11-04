import React from "react";

function StaffForm({
  isEdit,
  staffDetail,
  form,
  setStaffDetail,
  setForm,
  handleChangeRole,
  roleList,
}) {
  return (
    <div className="space-y-5">
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={isEdit ? staffDetail.username : form.username}
          onChange={(e) => {
            isEdit
              ? setStaffDetail({
                  ...staffDetail,
                  username: e.target.value,
                })
              : setForm({ ...form, username: e.target.value });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
          required
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
            required
          />
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Fullname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullname"
          placeholder="Fullname"
          value={isEdit ? staffDetail.fullname : form.fullname}
          onChange={(e) => {
            isEdit
              ? setStaffDetail({
                  ...staffDetail,
                  fullname: e.target.value,
                })
              : setForm({ ...form, fullname: e.target.value });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          placeholder="abc@email.com"
          value={isEdit ? staffDetail.email : form.email}
          onChange={(e) => {
            isEdit
              ? setStaffDetail({ ...staffDetail, email: e.target.value })
              : setForm({ ...form, email: e.target.value });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="0123456789"
          value={isEdit ? staffDetail.phone : form.phone}
          onChange={(e) => {
            isEdit
              ? setStaffDetail({ ...staffDetail, phone: e.target.value })
              : setForm({ ...form, phone: e.target.value });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
        />
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={isEdit ? staffDetail.address : form.address}
          onChange={(e) => {
            isEdit
              ? setStaffDetail({
                  ...staffDetail,
                  address: e.target.value,
                })
              : setForm({ ...form, address: e.target.value });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
          required
        />
      </div>

      {!isEdit && (
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={Array.isArray(form.role) && form.role.length > 0 ? form.role[0] : ""}
            onChange={handleChangeRole}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 bg-white cursor-pointer appearance-none"
            required
          >
            <option value="">Select role</option>
            {roleList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roleName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default StaffForm;
