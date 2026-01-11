import React from 'react'
import { useContext, useState } from 'react'; 
import {Line} from 'rc-progress'
import  AppContext  from '../../context/AppContext';
import Footer from '../../components/student/Footer';

const MyEnrollments = () => {
  const { enrolledCourses,calculateCourseDuration,navigate } = useContext(AppContext);
  const [progressArray,setProgressArray] = useState([
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:4,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:2,totalLectures:4}
  ])
  return (
    <>
    <div className='md:px-40 px-8 pt-10'>
      <h1 className='text-3xl font-semibold'>My Enrollments</h1>
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
          {enrolledCourses.map((course,index) => (
            <tr key={index} className='border-b border-gray-500/20 hover:bg-gray-20'>
              <td className='md:px-4 pl-4 md:pl-4 py-4 flex items-center gap-4'>
                <img src={course.courseThumbnail} alt={course.courseTitle} className='md:w-28 w-24 h-16 object-cover rounded-md m-4'/>
                <div className='flex-1 text-xl font-medium'>
                  <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                  <Line strokeWidth={2} percent={progressArray[index]?(
                    progressArray[index].lectureCompleted *100
                  )/progressArray[index].totalLectures:0} className='bg-gray-300 rounded-full'/>
                </div>
              </td>
              <td  className='px-4 py-3 max-sm:hidden'>
                {calculateCourseDuration(course)} hours
              </td >
              <td className='px-4 py-3 max-sm:hidden'>
                {progressArray[index] && `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`} Lessons
              </td>
              <td className='px-4 py-3 max-sm:text-right'>
                <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 
                max-sm:text-xs text-white' onClick={()=>navigate('/player/' +
                  course._id)}>{progressArray[index] && progressArray[index].lectureCompleted
                /progressArray[index].totalLectures ===1?'Completed':'On Going'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Footer/>
    </>
  )
}

export default MyEnrollments

