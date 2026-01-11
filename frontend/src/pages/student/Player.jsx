import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'

//student can watch the courses they are enrolled in
const Player = () => {
  // ensure we pull the correct helpers from context
  const { enrolledCourses, calculateChapterTime } = useContext(AppContext)
  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  // openSections should be an array so we can call .includes / .filter on it
  const [openSections, setOpenSections] = useState([])
  const[playerData,setPlayerData]=useState(null)

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
      }
    })
  }
  const toggleSection = (index) => {
    setOpenSections((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  };

  useEffect(() => {
    getCourseData()
  }, [enrolledCourses])
  return (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10
      md:px-36'>
        {/* left clm */}
        <div className='text-gray-800'>
          <h2 className='text-2xl font-semibold'>Course Structure</h2>
          <div className="space-y-4">
            {courseData &&  courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                <div
                  className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={assets.down_arrow_icon}
                      alt="toggle"
                      className={`w-5 h-5 transform transition-transform duration-200 ${openSections.includes(index) ? 'rotate-180' : ''
                        }`}
                    />
                    <p className="font-bold text-gray-800 text-lg md:text-2xl">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <div className="text-sm md:text-lg text-gray-500 font-medium">
                    {chapter.chapterContent.length} Lectures ·{' '}
                    {calculateChapterTime(chapter)}
                  </div>
                </div>

                {openSections.includes(index) && (
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <ul className="space-y-3">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={false? assets.blue_tick_icon :assets.play_icon}
                              alt="play"
                              className="w-5 h-5 opacity-70"
                            />
                            <p className="text-base md:text-xl text-gray-700 font-medium">
                              {lecture.lectureTitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm md:text-lg">
                            {lecture.lectureUrl && (
                              <p onClick={() => setPlayerData({
                                ...lecture,chapter:index+1,lecture:i+1
                              })}
                                className="text-blue-600 font-bold cursor-pointer hover:underline">
                                Watch
                              </p>
                            )}
                            <span className="text-gray-500">
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ['m'] }
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-2xl font-bold'>Rate this course:</h1>
            <Rating initialRating={0}/>
          </div>
        </div>

        {/* right clm */}

        <div className='md:mt-10'>
          {playerData?(<div>
            <YouTube videoId={playerData.lectureUrl.split('/').pop()}  iframeClassName='aspect-video w-full' />
            <div className='flex justify-between items-center mt-1'>
              <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
              <button className='text-blue-600'>{false? 'completed' : "Mark Complete"}</button>
            </div>
          </div>)
          :
          <img src={courseData? courseData.courseThumbnail : ''} alt='' />}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Player
