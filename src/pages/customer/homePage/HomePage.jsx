import React from "react";
import Banner from "../../../components/banner/Banner";
import Carousel from "../../../components/carousel/Carousel";
import TestDrive from "../../../components/testDrive/TestDrive";
import Banner2 from "../../../components/banner2/Banner2";
import BikeReview from "../../../components/bikeReview/BikeReview";
import ReviewCarousel from "../../../components/carousel/ReviewCarousel";

function HomePage() {
  return (
    <div>
      <section>
        <Banner />
      </section>
      <section className="p-5 my-5">
        <Carousel />
      </section>
      <section>
        <Banner2 />
      </section>
      {/* <section className="p-5">
        <TestDrive />
      </section> */}
      {/* <section>
        <ReviewCarousel />
      </section> */}
    </div>
  );
}

export default HomePage;
