import React, { useEffect, useState } from "react";
import Bike from "../../../assets/electric_bike.png";
import BannerDetail from "../../../components/bannerDetail/BannerDetail";
import BikeIntro from "../../../components/bikeIntro/BikeIntro";
import Specification from "../../../components/specification/Specification";
import { useParams } from "react-router";
import PublicApi from "../../../services/PublicApi";
import { toast } from "react-toastify";

function BikeDetail() {
  const { id } = useParams();
  const [generalInfo, setGeneralInfo] = useState({});
  const [appearance, setAppearance] = useState({});
  const [battery, setBattery] = useState({});
  const [configuration, setConfiguration] = useState({});
  const [safeFeature, setSafeFeature] = useState({});
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);

  const fecthMotorDeatil = async (id) => {
    try {
      const response = await PublicApi.getMotorDetailForUser(id);
      const data = response.data.data;
      setGeneralInfo(data);
      setAppearance(data.appearance);
      setBattery(data.battery);
      setColors(data.colors);
      setConfiguration(data.configuration);
      setSafeFeature(data.safeFeature);
      setImages(data.images);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fecthMotorDeatil(id);
  }, [id]);

  return (
    <div>
      <section className="mb-15">
        <BannerDetail
          bikeBattery={battery.type}
          bikeName={generalInfo.name}
          bikePrice={generalInfo.price}
          bikeSpeed={configuration.speedLimit}
          images={images}
          model={generalInfo.model}
          version={generalInfo.version}
        />
      </section>

      <section className="p-10 mb-10">
        <BikeIntro colors={colors} />
      </section>

      <section className="py-10 px-30 mb-15">
        <h1 className="text-4xl w-fit py-3 border-b-4 border-blue-600 mb-10">
          Specification
        </h1>
        <Specification
          batteryLimit={battery.limit}
          batteryType={battery.type}
          brake={safeFeature.brake}
          chargeTime={battery.chargeTime}
          chargeType={battery.chargeType}
          colors={colors}
          energyConsumption={battery.energyConsumption}
          height={appearance.height}
          length={appearance.length}
          lock={safeFeature.lock}
          maximumCapacity={configuration.maximumCapacity}
          motorType={configuration.motorType}
          speedLimit={configuration.speedLimit}
          storageLimit={appearance.storageLimit}
          width={appearance.width}
        />
      </section>
    </div>
  );
}

export default BikeDetail;
