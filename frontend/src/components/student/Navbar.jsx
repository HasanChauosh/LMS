import React from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useContext } from 'react'
import  AppContext  from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'



const Navbar = () => {
  const location = useLocation()
  const isCourseListPage = location.pathname.includes('/course-list')

  const { openSignUp } = useClerk()
  const { isSignedIn } = useUser()
  const { navigate, isEducator,backendURL,setIsEducator,getToken } = useContext(AppContext)

  const becomeEducator = async ()=>{
    try {
      if(isEducator) {
        navigate('/educator')
        return
      }
      const token = await getToken()
      const { data} = await axios.get(backendURL + '/api/educator/update-role',{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        setIsEducator(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('An error occurred while updating role.')
    }
  }

  return (
    <div
      // 1. Reduced horizontal padding (lg:px-12 instead of 36) to fill more width
      // 2. Increased vertical padding (py-7) for height
      // 3. Added stronger border color
      className={`flex items-center justify-between px-6 sm:px-12 md:px-16 lg:px-24 
      border-b border-gray-300 py-7
      ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}
    >
      {/* Logo: Increased width to w-40 (was w-28) */}
      <img onClick={() => { navigate('/') }}
        src={assets.logo}
        alt="Logo"
        className="w-32 lg:w-44 cursor-pointer"
      />

      {/* Desktop Navbar */}
      <div className="hidden md:flex items-center gap-12 text-gray-600"> 

        {isSignedIn && (
          <div className="flex items-center gap-8"> {/* Increased gap between links */}
            
            {/* Educator Link: Made text larger (text-xl), bold, and interactive */}
            <button onClick={becomeEducator} 
              className="text-xl font-semibold hover:text-blue-600 transition duration-300"
            >
              {isEducator ? 'Educator Dashboard' : 'Become Educator'}
            </button>

            {/* Enrollments Link: Made text larger (text-xl), bold, and interactive */}
            <Link 
              to="/my-enrollments" 
              className="text-xl font-semibold hover:text-blue-600 transition duration-300"
            >
              My Enrollments
            </Link>
          </div>
        )}

        {/* Auth Section */}
        {isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                // Increased Avatar size
                avatarBox: 'w-12 h-12' 
              }
            }}
            afterSignOutUrl="/"
          />
        ) : (
          <button
            onClick={() => openSignUp()}
            // Made button much larger: px-8 py-3, text-lg
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center gap-6 text-gray-600">

        {isSignedIn && (
          <div className="flex items-center gap-6">
            <button onClick={becomeEducator} className="text-lg font-medium">
              {isEducator ? 'Educator Dashboard' : 'Become Educator'}
            </button>

            <Link to="/my-enrollments" className="text-lg font-medium">My Enrollments</Link>
          </div>
        )}

        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <img
            src={assets.user_icon}
            alt="menu"
            className="w-8 h-8 cursor-pointer" // Increased icon size
            onClick={() => openSignUp()}
          />
        )}
      </div>
    </div>
  )
}

export default Navbar