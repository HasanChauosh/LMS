import React, { useEffect } from 'react'
import { useContext, useState } from 'react';
import { Line } from 'rc-progress'
import AppContext from '../../context/AppContext';
import Footer from '../../components/student/Footer';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration, navigate, userData, fetchUserEnrolledCourses, backendURL, getToken, calculateTotalLectures, accountStatus } = useContext(AppContext);
  const [progressArray, setProgressArray] = useState([])

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const tempProgressArray = await Promise.all(enrolledCourses.map(async (course) => {
        const totalLectures = calculateTotalLectures(course)

        try {
          const { data } = await axios.post(`${backendURL}/api/user/get-course-progress`, { courseId: course._id }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          const lectureCompleted = data?.progressData?.lectureCompleted?.length || 0
          return { lectureCompleted, totalLectures }
        } catch (error) {
          console.error('Course progress fetch failed for:', course?._id, error?.response?.data || error.message)
          return { lectureCompleted: 0, totalLectures }
        }
      })
      )
      setProgressArray(tempProgressArray)
    } catch (error) {
      console.error('getCourseProgress error:', error?.response?.data || error.message)
      setProgressArray(enrolledCourses.map((course) => ({
        lectureCompleted: 0,
        totalLectures: calculateTotalLectures(course)
      })))
    }
  }
  useEffect(()=>{
    if(userData){
      fetchUserEnrolledCourses()
    }
  },[userData])

    useEffect(()=>{
    if(enrolledCourses.length > 0){
      getCourseProgress()
    }
  },[enrolledCourses])

    const hasEnrollments = enrolledCourses.length > 0;
    const showSyncWarning = accountStatus === 'missing';
  return (
    <>
        <div className='md:px-40 px-8 pt-10 min-h-[60vh]'>
        <h1 className='text-3xl font-semibold'>My Enrollments</h1>
          {showSyncWarning && (
            <div className='mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900'>
              <p className='font-semibold'>Your account is not synced yet.</p>
              <p className='mt-1 text-sm'>Sign out and sign back in, or wait for the Clerk webhook to create your profile in MongoDB.</p>
            </div>
          )}
          {hasEnrollments ? (
            <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
              <thead className='text-gray-900 border-b border-gray-500/20 text-xl text-left max-sm:hidden'>
                <tr>
                  <th className='px-4 py-2 font-semibold truncate text-gray-700 text-2xl'>Course</th>
                  <th className='px-4 py-2 font-semibold truncate text-gray-700 text-2xl'>Duration</th>
                  <th className='px-4 py-2 font-semibold truncate text-gray-700 text-2xl'>Completed</th>
                  <th className='px-4 py-2 font-semibold truncate text-gray-700 text-2xl'>Status</th>
                </tr>
              </thead>

              <tbody className='text-gray-800 text-lg'>
                {enrolledCourses.map((course, index) => (
                  <tr key={index} className='border-b border-gray-500/20 hover:bg-gray-20'>
                    <td className='md:px-4 pl-4 md:pl-4 py-4 flex items-center gap-4'>
                      {(course.courseThumbnail || '').trim() ? (
                        <img src={course.courseThumbnail} alt={course.courseTitle} className='md:w-28 w-24 h-16 object-cover rounded-md m-4' />
                      ) : (
                        <div className='md:w-28 w-24 h-16 rounded-md m-4 bg-gray-200' />
                      )}
                      <div className='flex-1 text-xl font-medium'>
                        <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                        <Line strokeWidth={2} percent={progressArray[index] && progressArray[index].totalLectures > 0 ? (
                          progressArray[index].lectureCompleted * 100
                        ) / progressArray[index].totalLectures : 0} className='bg-gray-300 rounded-full' />
                      </div>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {calculateCourseDuration(course)}
                    </td >
                    <td className='px-4 py-3 max-sm:hidden'>
                      {`${progressArray[index]?.lectureCompleted ?? 0} / ${progressArray[index]?.totalLectures ?? calculateTotalLectures(course)}`} Lessons
                    </td>
                    <td className='px-4 py-3 max-sm:text-right'>
                      <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 
                    max-sm:text-xs text-white' onClick={() => navigate('/player/' +
                        course._id)}>{(progressArray[index]?.lectureCompleted ?? 0)
                          / (progressArray[index]?.totalLectures || calculateTotalLectures(course) || 1) === 1 ? 'Completed' : 'On Going'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='mt-10 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600'>
              <p className='text-xl font-medium text-gray-800'>No enrollments yet.</p>
              <p className='mt-2'>Sign in with your active Clerk session and enroll in a course to see it here.</p>
              <button
                className='mt-6 px-5 py-2 rounded-md bg-blue-600 text-white'
                onClick={() => navigate('/course-list')}
              >
                Browse Courses
              </button>
            </div>
          )}
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollments

