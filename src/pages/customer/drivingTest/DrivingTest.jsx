import React, { useEffect, useState } from "react";
import TestDrive from "../../../components/testDrive/TestDrive";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";

function DrivingTest() {
  const [agencyList, setAgencyList] = useState([]);
  // const [motorList, setMotorList] = useState([]);

  const [submit, setSubmit] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    driveDate: "",
    driveTime: "",
    motorbikeId: "",
    agencyId: "",
  });

  useEffect(() => {
    // const fetchMotor = async () => {
    //   try {
    //     const response = await PublicApi.getMotorList({ page: 1, limit: 100 });
    //     setMotorList(response.data.data);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    const fetchAgency = async () => {
      try {
        const response = await PublicApi.getAgencyListCustomer({
          page: 1,
          limit: 50,
        });
        setAgencyList(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAgency();
  }, []);

  const handleSubmitDrive = async (e) => {
    e.preventDefault();
    setSubmit(true);
    let formattedDriveTime = form.driveTime;
    if (form.driveTime && form.driveTime.length <= 5) {
      formattedDriveTime = `${form.driveTime}:00`;
    }
    const sendData = {
      ...form,
      motorbikeId: Number(form.motorbikeId),
      agencyId: Number(form.agencyId),
      driveTime: formattedDriveTime,
    };
    try {
      await PublicApi.submitDrivingTest(sendData);
      toast.success("Submit success");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmit(false);
    }
  };

  return (
    <div className="p-5">
      <TestDrive
        agencyList={agencyList}
        form={form}
        setForm={setForm}
        submit={submit}
        handleSubmit={handleSubmitDrive}
      />
    </div>
  );
}

export default DrivingTest;
