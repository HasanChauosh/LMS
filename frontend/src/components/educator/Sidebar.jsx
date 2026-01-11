import React from 'react'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import { useContext } from 'react'
import AppContext from '../../context/AppContext'

const Sidebar = () => {
  const { isEducator } = useContext(AppContext)
  
  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { name: 'Students Enrolled', path: '/educator/students-enrolled', icon: assets.person_tick_icon }
  ];

  return isEducator && (
    /* Increased width from w-64 to w-72 or w-80 for a more "pro" look */
    <div className='md:w-72 w-20 border-r min-h-screen bg-white text-base border-gray-200 flex flex-col pt-8 shadow-sm'>
      <div className='flex flex-col gap-2'>
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === '/educator'}
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 transition-all duration-200
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}
            `}
          >
            {/* Standardized icon size */}
            <img src={item.icon} alt={item.name} className='w-6 h-6 object-contain' />
            
            {/* Wider text with better spacing */}
            <p className='md:block hidden text-[17px] tracking-wide'>
              {item.name}
            </p>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar