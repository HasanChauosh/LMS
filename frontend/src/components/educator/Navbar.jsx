import React from 'react'
import { assets, dummyEducatorData } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const educatorData=dummyEducatorData
  const {user} = useUser()
  return (
    <div className='flex items-center justify-between px-6 sm:px-12 md:px-16 lg:px-24 py-7 border-b border-gray-300'>
      <Link to='/'>
      <img src={assets.logo} alt="logo" className='w-32 h-12 lg:w-48 lg:h-18 cursor-pointer' />
      </Link>
      <div className='flex items-center gap-5 text-gray-600 relative py-1 px-2 rounded-full'>
        <p className='font-semibold text-2xl'>Hi!{user?user.fullName:"Developers"}</p>
        {user?<UserButton/>:<img className='w-10 h-10 rounded-full' src={assets.profile_img} alt="" />}
      </div>
    </div>
  )
}

export default Navbar
