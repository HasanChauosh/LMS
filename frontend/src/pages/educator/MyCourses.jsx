import React, { useContext, useState, useEffect } from 'react'
import AppContext from '../../context/AppContext'
import Loading from '../../components/student/Loading'

const MyCourses = () => {
  const [courses, setCourses] = useState(null)
  const { currency, allCourses } = useContext(AppContext)

  const fetchEducatorCourses = async () => {
    setCourses(allCourses)
  }

  useEffect(() => {
    fetchEducatorCourses()
  }, [allCourses])

  return courses ? (
    <div className='min-h-screen bg-[#f8fafc] p-4 md:p-10 lg:p-12'>
      
      {/* Header Section */}
      <div className='mb-10'>
        <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight'>
          My Courses
        </h2>
        <p className='text-gray-500 mt-2 text-base md:text-lg'>
          Manage and track the performance of your published content.
        </p>
      </div>

      {/* Table Container Card */}
      <div className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            
            {/* Table Header */}
            <thead className='bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider'>
              <tr>
                <th className='px-8 py-5'>All Courses</th>
                <th className='px-8 py-5'>Earnings</th>
                <th className='px-8 py-5'>Students</th>
                <th className='px-8 py-5'>Published On</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className='divide-y divide-gray-50'>
              {courses.map((course) => (
                <tr key={course._id} className='hover:bg-gray-50/50 transition-colors group'>
                  
                  {/* Course Info Column */}
                  <td className='px-8 py-6 flex items-center gap-4'>
                    <img 
                      src={course.courseThumbnail} 
                      alt="thumbnail" 
                      className='w-16 h-10 md:w-20 md:h-12 rounded-lg object-cover shadow-sm'
                    />
                    <span className='font-bold text-gray-800 text-lg md:text-xl truncate max-w-xs'>
                      {course.courseTitle}
                    </span>
                  </td>

                  {/* Earnings Column */}
                  <td className='px-8 py-6 text-gray-700 text-lg md:text-xl font-semibold'>
                    {currency}{(course.enrolledStudents.length * course.coursePrice).toLocaleString()}
                  </td>

                  {/* Students Column */}
                  <td className='px-8 py-6 text-gray-700 text-lg md:text-xl font-medium'>
                    {course.enrolledStudents.length}
                  </td>

                  {/* Date Column */}
                  <td className='px-8 py-6 text-gray-500 text-lg'>
                    {new Date(course.createdAt).toLocaleDateString()}
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

export default MyCourses