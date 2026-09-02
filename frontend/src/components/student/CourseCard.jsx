import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const CourseCard = ({ course }) => {
  const { currency, calculateCourseRating } = useContext(AppContext)
  const rating = calculateCourseRating(course);
  const educatorName = course?.educator?.name || 'Unknown educator';
  const courseTitle = course?.courseTitle || 'Untitled course';
  const courseThumbnail = course?.courseThumbnail || '';
  const ratingCount = Array.isArray(course?.courseRatings) ? course.courseRatings.length : 0;
  const coursePrice = Number(course?.coursePrice || 0);
  const discount = Number(course?.discount || 0);
  const discountedPrice = coursePrice - (discount * coursePrice) / 100;
  return (
    <Link to={`/course/${course?._id || '#'}`} onClick={() => window.scrollTo(0, 0)}
      className='border border-gray-300 rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300'>
      <img className='w-full' src={courseThumbnail} alt={courseTitle} />

      <div className='p-4 space-y-2 text-left'>
        <h3 className='text-lg font-semibold'>{courseTitle}</h3>
        <p className='text-gray-600'>{educatorName}</p>

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

          <p className='text-gray-500'>{ratingCount}</p>
        </div>

        <p className='text-gray-800 text-base font-semibold'>{currency} {discountedPrice.toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCard
