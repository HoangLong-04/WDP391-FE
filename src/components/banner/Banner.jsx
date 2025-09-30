import Lightning from "../../assets/lightning_logo.png";
import Bike from "../../assets/electric_bike.png";

function Banner() {
  return (
    <div className="flex justify-between items-center bg-[rgb(177,184,195)] px-[5rem]">
      <div>
        <img className="rotate-12" width={310} src={Lightning} alt="" />
        <p className="absolute top-[24rem] text-4xl font-bold left-[12rem] italic -rotate-35">
          EVDOCK
        </p>
      </div>
      <div className="bg-[rgb(143,157,177)] w-[25rem] h-[26rem] -skew-x-15 flex flex-col justify-center items-center text-white text-5xl font-bold">
        <p>Drive the Future</p>
        <p>Power the</p>
        <p>Present</p>
      </div>
      <div>
        <img width={310} src={Bike} alt="" />
      </div>
    </div>
  );
}

export default Banner;
