import React from 'react'
import { Link } from 'react-router-dom'
import CourseCard from './CourseCard';
import { useContext } from 'react'; 
import  AppContext  from '../../context/AppContext';


const CoursesSection = () => {
    const {allCourses} = useContext(AppContext);
  return (
  <div className="py-24 px-8 md:px-20 text-center w-full bg-white">
    
    {/* Heading - Increased to text-4xl */}
    <h2 className="text-4xl font-bold text-gray-800">
      Learn from the Best in the Industry
    </h2>

    {/* Description - Increased to text-xl and max-width-4xl */}
    <p className="text-2xl text-gray-500 mt-6 max-w-4xl mx-auto leading-relaxed">
      Explore our curated collection of top-rated courses across diverse categories.
      From coding and design to business and personal wellness, each course is
      thoughtfully crafted to help you gain real-world skills and achieve meaningful results.
    </p>

    {/* Course Grid - Increased gap to gap-10 for breathing room */}
    <div className='mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 px-4 md:px-0'>
        {allCourses.slice(0,4).map((course,index)=><CourseCard key={index} course={course} />)}
    </div>
    
    {/* Button - Increased size (px-12 py-4) and text (text-xl) */}
    <Link
      to="/course-list"
      onClick={() => window.scrollTo(0, 0)}
      className="inline-block mt-16 text-gray-600 border border-gray-500/50
                 px-12 py-4 rounded-full text-xl font-medium
                 hover:bg-gray-100 hover:text-black hover:border-black transition-all duration-300"
    >
      Show All Courses
    </Link>

  </div>
)

}

export default CoursesSection