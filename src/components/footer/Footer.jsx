import React from 'react'
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';

function Footer() {
  return (
    <div className='bg-black bottom-0 flex justify-center p-4'>
      <div className='flex flex-col gap-5'>
        <p className='text-white text-xl font-medium'>CONTACT US AT</p>
        <div className='flex gap-2'>
          <CallIcon sx={{color: 'white'}} />
          <p className='cursor-pointer hover:underline text-[rgb(98,158,255)]'>+84 368870624</p>
        </div>
        <div className='flex gap-2'>
          <EmailIcon sx={{color: 'white'}} />
          <p className='cursor-pointer hover:underline text-[rgb(98,158,255)]'>longlhse182935@fpt.edu.vn</p>
        </div>
        <div className='flex gap-2'>
          <FacebookIcon sx={{color: 'white'}} />
          <p className='cursor-pointer hover:underline text-[rgb(98,158,255)]'>fb</p>
        </div>
      </div>
    </div>
  )
}

export default Footer