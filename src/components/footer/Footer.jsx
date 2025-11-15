import React from 'react'
import { Facebook, Mail, Phone } from "lucide-react";

function Footer() {
  return (
    <div className='bg-black bottom-0 flex justify-center p-4'>
      <div className='flex flex-col gap-5'>
        <p className='text-white text-xl font-medium'>CONTACT US AT</p>
        <div className='flex gap-2'>
          <Phone className="text-white w-5 h-5" />
          <p className='cursor-pointer hover:underline text-[rgb(98,158,255)]'>+84 368870624</p>
        </div>
        <div className='flex gap-2'>
          <Mail className="text-white w-5 h-5" />
          <p className='cursor-pointer hover:underline text-[rgb(98,158,255)]'>longlhse182935@fpt.edu.vn</p>
        </div>
        <div className='flex gap-2'>
          <Facebook className="text-white w-5 h-5" />
          <p className='cursor-pointer hover:underline text-[rgb(98,158,255)]'>fb</p>
        </div>
      </div>
    </div>
  )
}

export default Footer