import React from "react";
import Bike from "../../assets/electric_bike.png";

function Banner2() {
  return (
    <div className="relative w-full h-[75dvh] flex items-center justify-between px-20 bg-[url('assets/banner_2.jpg')] bg-cover bg-center">
  {/* overlay để làm tối background */}
  <div className="absolute inset-0 bg-black/50"></div>

  {/* nội dung */}
  <div className="relative z-10 flex items-center justify-between w-full">
    <div>
      <img width={500} src={Bike} alt="" />
    </div>
    <div className="text-white">
      <p className="italic text-8xl font-bold mb-5 text-end">EVDock</p>
      <div className="text-end text-2xl font-semibold">
        <p>EVDock is a pioneering electric motorbike</p>
        <p>brand aiming for a green, modern and</p>
        <p>convenient lifestyle. EVM electric motorbike</p>
        <p>models are designed with a youthful, dynamic</p>
        <p>style, suitable for many subjects from</p>
        <p>students, office workers to families.</p>
      </div>
    </div>
  </div>
</div>

  );
}

export default Banner2;
