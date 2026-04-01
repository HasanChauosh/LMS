import React, { useState, useEffect } from 'react'
import Loading from '../../components/student/Loading'
import AppContext from '../../context/AppContext'
import { useContext } from 'react'

const StudentsEnrolled = () => {
  const { backendURL, getToken, isEducator } = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const data = await fetch(backendURL + '/api/educator/enrolled-students', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await data.json()
      if (result.success) {
        setEnrolledStudents(result.enrolledStudentsWithPurchases || result.students || [])
      } else {
        setEnrolledStudents([])
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error)
      setEnrolledStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(isEducator) {
      fetchEnrolledStudents()
    }
  }, [isEducator])

  if (loading) return <Loading />

  return (
    <div className='min-h-screen bg-[#f8fafc] p-4 md:p-10 lg:p-12'>
      
      {/* Page Header */}
      <div className='mb-10'>
        <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight'>
          Enrolled Students
        </h1>
        <p className='text-gray-500 mt-2 text-base md:text-lg'>
          View and manage all students currently enrolled in your courses.
        </p>
      </div>

      {/* Main Table Container */}
      <div className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-8 py-5 hidden sm:table-cell">#</th>
                <th className="px-8 py-5">Student Name</th>
                <th className="px-8 py-5">Course Title</th>
                <th className="px-8 py-5 hidden md:table-cell">Enrolled Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {enrolledStudents.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* ID Column */}
                  <td className="px-8 py-6 text-gray-400 text-lg hidden sm:table-cell">
                    {index + 1}
                  </td>

                  {/* Student Info */}
                  <td className="px-8 py-6 flex items-center gap-4">
                    <img
                      src={item.student.imageUrl}
                      alt="Student"
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100"
                    />
                    <span className="font-bold text-gray-800 text-lg md:text-xl">
                      {item.student.name}
                    </span>
                  </td>

                  {/* Course Title */}
                  <td className="px-8 py-6 text-gray-600 text-lg md:text-xl font-medium">
                    {item.courseTitle}
                  </td>

                  {/* Date Column */}
                  <td className="px-8 py-6 text-gray-500 text-base md:text-lg hidden md:table-cell">
                    {new Date(item.purchaseDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>

                </tr>
              ))}
              {enrolledStudents.length === 0 && (
                <tr>
                  <td className="px-8 py-10 text-gray-500" colSpan={4}>
                    No students enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentsEnrolled