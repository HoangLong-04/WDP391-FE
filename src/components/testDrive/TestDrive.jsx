import React from "react";

function TestDrive() {
  return (
    <div className="py-5 px-12 rounded-sm shadow-xl/30">
      <p className="text-center text-4xl font-semibold mb-2">
        SIGN UP FOR A TEST DRIVE
      </p>
      <p className="text-center mb-2">
        To register a test drive, you need to provide driver's lisence to EVDock
      </p>
      <p className="border-2 border-[rgb(196,196,196)] mb-10"></p>
      <form className="grid grid-cols-2 gap-4 mb-10">
        <div>CUSTOMER INFOMATION</div>
        <div>CHOOSE THE TYPE OF ELECTRIC MOTORBIKE</div>
        <div>
          <input
            className="border-1 border-[rgb(196,196,196)] w-full p-2"
            type="text"
            placeholder="Full name"
          />
        </div>
        <div>
          {/* <input
            className="border-1 border-[rgb(196,196,196)] w-full p-2"
            type="text"
            placeholder="Electric motorbike model"
          /> */}
          <select className="w-full p-2 border-1 border-[rgb(196,196,196)] outline-0" name="" id="">
            <option value="test1">Test 1</option>
            <option value="test2">Test 2</option>
          </select>
        </div>
        <div>
          <input
            className="border-1 border-[rgb(196,196,196)] w-full p-2"
            type="tel"
            placeholder="Phone number"
          />
        </div>
        <div>SELECT THE LOCATION</div>
        <div>
          <input
            className="border-1 border-[rgb(196,196,196)] w-full p-2"
            type="email"
            placeholder="Email"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              className="border-1 w-full p-2"
              type="text"
              placeholder="hello"
            />
          </div>
          <div>
            <input
              className="border-1 w-full p-2"
              type="text"
              placeholder="tel"
            />
          </div>
        </div>
      </form>
      <div className="flex justify-center items-center">
        <button className="py-2 px-10 cursor-pointer bg-[rgb(139,139,139)] hover:bg-[rgb(154,153,153)] transition text-2xl font-semibold text-white rounded-sm flex justify-center items-center">Sign up for a drive test</button>
      </div>
    </div>
  );
}

export default TestDrive;
