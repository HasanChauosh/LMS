import React, { useContext } from 'react'
import App from '../../App'
import AppContext from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const CourseCard = ({ course }) => {
  const { currency, calculateCourseRating } = useContext(AppContext)
  const rating = calculateCourseRating(course);
  return (
    <Link to={`/course/${course._id}`} onClick={() => window.scrollTo(0, 0)}
      className='border border-gray-300 rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300'>
      <img className='w-full' src={course.courseThumbnail} alt="" />

      <div className='p-4 space-y-2 text-left'>
        <h3 className='text-lg font-semibold'>{course.courseTitle}</h3>
        <p className='text-gray-600'>{course.educator.name}</p>

        <div className='flex items-center space-x-2'>
          <p>{rating}</p>

          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.floor(rating) ? assets.star : assets.star_blank}
                alt=""
                className="w-4 h-4"
              />
            ))}
          </div>

          <p className='text-gray-500'>{course.courseRatings.length}</p>
        </div>

        <p className='text-gray-800 text-base font-semibold'>{currency} {(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCard
