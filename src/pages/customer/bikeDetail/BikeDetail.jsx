import React from "react";
import Bike from "../../../assets/electric_bike.png";
import BannerDetail from "../../../components/bannerDetail/BannerDetail";
import BikeIntro from "../../../components/bikeIntro/BikeIntro";
import Specification from "../../../components/specification/Specification";

function BikeDetail() {
  const bike = {
    name: "ZX100",
    speed: "150km/h",
    battery: "200Ah",
    price: 20000000,
    img: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwd2263d91/images/PDP-XMD/evo200/img-evo-yellow.png",
  };
  return (
    <div>
      <section className="mb-15">
        <BannerDetail
          bikeBattery={bike.battery}
          bikeImg={bike.img}
          bikeName={bike.name}
          bikePrice={bike.price}
          bikeSpeed={bike.speed}
        />
      </section>

      <section className="p-10 mb-10">
        <BikeIntro bikeImg={bike.img} />
      </section>

      <section className="py-10 px-30 mb-15">
        <h1 className="text-4xl w-fit py-3 border-b-4 border-blue-600 mb-10">Specification</h1>
        <Specification
          color={"xanh"}
          chargeTime={"10h"}
          normalPower={"2000W"}
          engine={"Tiger"}
          shock={"Ống lồng-giảm chấn thủy lực"}
          capacity={"2.0 kWh"}
          batteryType={"01 Pin LFP"}
          maxSpeed={"60km/h"}
          maxPower={"3000W"}
          brake={"Phanh đĩa/cơ"}
          volume={"1804 x 683 x 1127 mm"}
          weight={"88 kg bao gồm pin LFP"}
        />
      </section>
    </div>
  );
}

export default BikeDetail;
