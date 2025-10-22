import React from "react";
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';

function BikeIntro({ bikeImg }) {
  return (
    <div className="grid grid-cols-3">
      <div className="grid grid-rows-2 gap-30">
        <div className="flex gap-2">
          <span><EmojiObjectsOutlinedIcon sx={{fontSize: '100px'}} /></span>
          <div>
            <span className="text-2xl font-semibold">DESIGN</span>
            <p>Compact, modern design,</p>
            <p>easy to move in the city, and</p>
            <p>suitable for dynamic style</p>
          </div>
          
        </div>
        <div className="flex gap-2">
          <span><VerifiedUserOutlinedIcon sx={{fontSize: '100px'}} /></span>
          <div>
            <span className="text-2xl font-semibold">BODY</span>
            <p>Sturdy steel frame combined with</p>
            <p>durable, lightweight, plastic shell</p>
            <p>providing safety and durability overtime</p>
          </div>
          
        </div>
      </div>
      <div>
        <img src={bikeImg} alt="" />
      </div>
      <div className="grid grid-rows-2 gap-30">
        <div className="flex gap-2">
          <span><EnergySavingsLeafOutlinedIcon sx={{fontSize: '100px'}} /></span>
          <div>
            <span className="text-2xl font-semibold">SAVINGS</span>
            <p>Smooth operation, charging cost are</p>
            <p>much cheaper than gasoline vehicles</p>
            <p>environmentally friendly</p>
          </div>
          
        </div>
        <div className="flex gap-2">
          <span><ElectricBoltOutlinedIcon sx={{fontSize: '100px'}} /></span>
          <div>
            <span className="text-2xl font-semibold">VARIETY OF FUNCTIONS</span>
            <p>Compact, modern design,</p>
            <p>easy to move in the city, and</p>
            <p>suitable for dynamic style</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default BikeIntro;
