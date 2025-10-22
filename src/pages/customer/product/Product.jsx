import React from "react";
import ProductHeader from "../../../components/productHeader/ProductHeader";
import BikeCard from "../../../components/bikeCard/BikeCard";

function Product() {
  const bikeList = [
    {
      name: "test1",
      price: 2999000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test2",
      price: 6999000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test3",
      price: 6799000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test4",
      price: 1232000,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
    {
      name: "test5",
      price: 666666,
      image:
        "https://osakar.com.vn/wp-content/uploads/2025/05/nispa-lumia-ava-1024x1024.png",
    },
  ];
  return (
    <div>
      <header className="p-10">
        <ProductHeader />
      </header>
      <main className="grid grid-cols-3 gap-10 p-10">
        {bikeList.map((b) => (
          <div className="scale-95">
            <BikeCard image={b.image} name={b.name} price={b.price} />
          </div>
        ))}
      </main>
    </div>
  );
}

export default Product;
