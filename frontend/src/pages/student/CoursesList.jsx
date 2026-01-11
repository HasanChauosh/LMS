import React, { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppContext from '../../context/AppContext';
import SearchBar from '../../components/student/SearchBar';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';
const CoursesList = () => {
  const navigate = useNavigate();
  const { allCourses } = useContext(AppContext);

  const { input } = useParams();
  const [filteredCourses, setFilteredCourses] = React.useState([]);

  React.useEffect(() => {
    if (allCourses.length > 0 && input) {
      const tempCourses = allCourses.slice()
      input ?
        setFilteredCourses(tempCourses.filter(item => item.courseTitle.toLowerCase().includes(input.toLowerCase())))
        : setFilteredCourses(allCourses);
    } else {
      setFilteredCourses(allCourses);
    }
  }, [input, allCourses]);

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        <div className='flex md:flex-row flex-col md:justify-between justify-center md:items-center items-start w-full'>
          <div>
            <h1 className='text-4xl font-bold text-gray-800'>Courses List </h1>
            <p className='text-gray-600 mt-2'>
              <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/')}>Home </span> /<span>Courses List</span>
            </p>
          </div>
          <SearchBar data={input} />
        </div>
        {
          input && (
            <div className="flex items-center gap-2 mt-6">
              <span className="text-sm text-gray-600">Showing results for</span>

              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
                {input}
                <img
                  src={assets.cross_icon}
                  alt="clear search"
                  className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition"
                  onClick={() => navigate('/course-list')}
                />
              </div>
            </div>
          )
        }
        <div className='grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1  lg:grid-cols-4 my-16 gap-6 mt-10 mb-20'>
          {/* Courses List Content Goes Here */}
          {filteredCourses.map((course, index) => <CourseCard key={index} course={course} />)}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CoursesList
