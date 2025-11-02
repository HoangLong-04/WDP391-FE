import React from "react";

function TestDrive({
  form,
  setForm,
  motorList,
  agencyList,
  handleSubmit,
  submit,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    const processedValue =
      (name === "motorbikeId" || name === "agencyId") && value === ""
        ? null
        : value;

    setForm((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };
  const inputStyle = "border-1 border-[rgb(196,196,196)] w-full p-2";
  return (
    <div className="py-5 px-12 rounded-sm shadow-xl/30">
      <p className="text-center text-4xl font-semibold mb-2">
        SIGN UP FOR A TEST DRIVE
      </p>
      <p className="text-center mb-2">
        To register a test drive, you need to provide driver's lisence to EVDock
      </p>
      <p className="border-2 border-[rgb(196,196,196)] mb-10"></p>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-10">
        <div className="font-semibold text-lg">CUSTOMER INFORMATION</div>

        <div className="font-semibold text-lg">APPOINTMENT DETAILS</div>

        <div>
          <input
            className={inputStyle}
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            placeholder="Full Name"
            required
          />
        </div>
        <div>
          <select
            className="border-1 border-[rgb(196,196,196)] w-full p-3"
            name="motorbikeId"
            value={form.motorbikeId || ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              -- Choose Motorbike Type --
            </option>
            {motorList.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name} - {bike.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            className={inputStyle}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              className={inputStyle}
              type="date"
              name="driveDate"
              value={form.driveDate}
              onChange={handleChange}
              title="Date for Test Drive"
              required
            />
          </div>
          <div>
            <input
              className={inputStyle}
              type="time"
              name="driveTime"
              value={form.driveTime}
              onChange={handleChange}
              title="Time for Test Drive"
              required
            />
          </div>
        </div>

        <div>
          <input
            className={inputStyle}
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
        </div>
        <div>
          <select
            className="border-1 border-[rgb(196,196,196)] w-full p-3"
            name="agencyId"
            value={form.agencyId || ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              -- Select Location / Agency --
            </option>
            {agencyList.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name} - {agency.location}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex justify-center items-center">
        <button
          disabled={submit}
          onClick={handleSubmit}
          className="py-2 px-10 cursor-pointer bg-[rgb(139,139,139)] hover:bg-[rgb(154,153,153)] transition text-2xl font-semibold text-white rounded-sm flex justify-center items-center"
        >
          {submit ? "Submitting..." : "Sign up for a drive test"}
        </button>
      </div>
    </div>
  );
}

export default TestDrive;
