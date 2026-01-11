import React, { useContext, useState, useEffect } from 'react'
import AppContext from '../../context/AppContext'
import { assets, dummyDashboardData } from '../../assets/assets'
import Loading from '../../components/student/Loading'

const Dashboard = () => {
  const { currency } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    // Simulating API call
    setDashboardData(dummyDashboardData)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return dashboardData ? (
    <div className='min-h-screen bg-[#f8fafc] p-4 md:p-10 lg:p-12'>

      {/* Header Section */}
      <div className='mb-12'>
        <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight'>
          Dashboard Overview
        </h1>
        <p className='text-gray-500 mt-2 text-base md:text-lg'>
          Welcome back! Here’s what’s happening with your courses today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12'>

        {/* Total Courses Card */}
        <div className='bg-white group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 p-8 rounded-3xl border border-gray-100 flex items-center gap-6'>
          <div className='w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-50 group-hover:bg-blue-600 transition-all duration-500 shadow-inner'>
            <img src={assets.appointments_icon} alt="icon" className='w-8 h-8 group-hover:invert transition-all' />
          </div>
          <div>
            <p className='text-gray-400 font-semibold uppercase tracking-widest text-[10px]'>Total Courses</p>
            <p className='text-3xl font-bold text-gray-800 mt-1'>{dashboardData.totalCourses}</p>
          </div>
        </div>

        {/* Enrolled Students Card */}
        <div className='bg-white group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 p-8 rounded-3xl border border-gray-100 flex items-center gap-6'>
          <div className='w-16 h-16 flex items-center justify-center rounded-2xl bg-purple-50 group-hover:bg-purple-600 transition-all duration-500 shadow-inner'>
            <img src={assets.patients_icon} alt="icon" className='w-8 h-8 group-hover:invert transition-all' />
          </div>
          <div>
            <p className='text-gray-400 font-semibold uppercase tracking-widest text-[10px]'>Enrolled Students</p>
            <p className='text-3xl font-bold text-gray-800 mt-1'>{dashboardData.enrolledStudentsData.length}</p>
          </div>
        </div>

        {/* Total Earnings Card */}
        <div className='bg-white group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 p-8 rounded-3xl border border-gray-100 flex items-center gap-6'>
          <div className='w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 transition-all duration-500 shadow-inner'>
            <img src={assets.earning_icon} alt="icon" className='w-8 h-8 group-hover:invert transition-all' />
          </div>
          <div>
            <p className='text-gray-400 font-semibold uppercase tracking-widest text-[10px]'>Total Earnings</p>
            <p className='text-3xl font-bold text-gray-800 mt-1'>{currency}{dashboardData.totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Latest Enrolments Table Section */}
      <div className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'>
        <div className='px-8 py-6 border-b border-gray-50'>
          <h2 className='text-xl font-bold text-gray-800'>Latest Enrolments</h2>
        </div>
        
        <div className='overflow-x-auto'>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-8 py-5 hidden sm:table-cell text-xl text-bold">#</th>
                <th className="px-8 py-5 text-xl text-bold">Student Name</th>
                <th className="px-8 py-5 text-xl text-bold">Course Title</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {dashboardData.enrolledStudentsData.slice(0, 5).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 text-gray-400 text-lg hidden sm:table-cell">
                    {index + 1}
                  </td>

                  <td className="px-8 py-6 flex items-center gap-4">
                    <img
                      src={item.student.imageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                    <span className="font-bold text-gray-800 text-lg md:text-xl">
                      {item.student.name}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-gray-600 text-lg md:text-xl font-medium">
                    {item.courseTitle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  ) : <Loading />
}

export default Dashboard