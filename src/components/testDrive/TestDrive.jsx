import React, { useEffect, useState } from "react";
import PublicApi from "../../services/PublicApi";

function TestDrive({ form, setForm, agencyList, handleSubmit, submit }) {
  const [motorList, setMotorList] = useState([]);
  const [loadingMotor, setLoadingMotor] = useState(false);
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

  const handleAgencyChange = (e) => {
    const agencyId = e.target.value;
    setForm((prev) => ({ ...prev, agencyId, motorbikeId: "" }));
  };

  const fetchAvailableMotor = async () => {
    setLoadingMotor(true);
    try {
      const response = await PublicApi.getMotorListDriveTrial(form.agencyId);
      setMotorList(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMotor(false);
    }
  };

  useEffect(() => {
    if (!form.agencyId) {
      setMotorList([]);
      return;
    }
    fetchAvailableMotor();
  }, [form.agencyId]);

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
            name="agencyId"
            value={form.agencyId || ""}
            onChange={handleAgencyChange}
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
        {!form.agencyId ? (
          <div className="text-gray-500 italic">
            Please choose an agency first
          </div>
        ) : loadingMotor ? (
          <div className="text-blue-600">Loading motorbikes...</div>
        ) : motorList.length === 0 ? (
          <div className="text-red-500">
            No motorbikes available for this agency
          </div>
        ) : (
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
                {bike.name}
              </option>
            ))}
          </select>
        )}
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
