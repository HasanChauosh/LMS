import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../../context/AppContext'
import { useParams, useSearchParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'

//student can watch the courses they are enrolled in
const Player = () => {
  // ensure we pull the correct helpers from context
  const { enrolledCourses, calculateChapterTime, backendURL,getToken,userData,fetchUserEnrolledCourses } = useContext(AppContext)
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const previewUrl = searchParams.get('preview')
  const [courseData, setCourseData] = useState(null)
  // openSections should be an array so we can call .includes / .filter on it
  const [openSections, setOpenSections] = useState([])
  const[playerData,setPlayerData]=useState(null)

  const[progressData,setProgressData]=useState(null)

  const [initialRating,setInitialRating]=useState(0)

  const getYouTubeVideoId = (url = '') => {
    try {
      const parsed = new URL(url)
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.replace('/', '')
      }
      if (parsed.hostname.includes('youtube.com')) {
        return parsed.searchParams.get('v') || parsed.pathname.split('/').pop()
      }
      return ''
    } catch {
      return ''
    }
  }

  const getCourseData = () => {
    if (previewUrl) {
      // Preview mode - fetch course details from API
      fetchCourseForPreview()
    } else {
      // Regular enrolled mode
      const currentCourse = enrolledCourses.find((course) => course._id === courseId)
      if (!currentCourse) return

      setCourseData(currentCourse)
      setInitialRating(0)

      const userRating = currentCourse.courseRatings?.find((item) => item.userId === userData?._id)
      if (userRating) {
        setInitialRating(userRating.rating)
      }
    }
  }

  const fetchCourseForPreview = async () => {
    try {
      const { data } = await axios.get(backendURL + '/api/course/' + courseId);
      if (data.success) {
        setCourseData(data.courseData);
        // Set the preview video as playerData
        setPlayerData({
          lectureUrl: previewUrl,
          lectureTitle: 'Preview Lecture',
          chapter: 0,
          lecture: 0
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load preview');
    }
  }
  const toggleSection = (index) => {
    setOpenSections((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  };

  useEffect(() => {
    if (previewUrl) {
      getCourseData()
      return
    }
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses, previewUrl, courseId])

  const markLectureComplete = async(lectureId)=>{
    try {
      const token = await getToken();
      const {data} = await axios.post(backendURL + '/api/user/update-course-progress',{
        courseId,
        lectureId
      },{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      if(data.success){
        setProgressData((prev) => {
          const completed = prev?.lectureCompleted || []
          if (completed.includes(lectureId)) return prev
          return { ...(prev || {}), lectureCompleted: [...completed, lectureId] }
        })
        toast.success(data.message || 'Lecture marked as complete')
        getCourseProgress();
      } else {
        toast.error(data.message || 'Failed to mark lecture as complete')
      }
    } catch (error) {
      console.error('Error marking lecture as complete:', error);
      toast.error(error?.response?.data?.message || 'Failed to mark lecture as complete')
    }
  }

  const getCourseProgress = async()=>{
    try {
      const token = await getToken();
      const {data} = await axios.post(backendURL + '/api/user/get-course-progress' ,{ courseId },{
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      if(data.success){
        setProgressData(data.progressData || { lectureCompleted: [] });
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
      setProgressData({ lectureCompleted: [] });
    }
  }

  const handleRate = async(rating)=>{
    try {
      const token = await getToken();
      const {data}= await axios.post(backendURL + '/api/user/add-rating',{courseId,rating},{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      if(data.success){
        toast.success(data.message || 'Rating submitted successfully')
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error rating course:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit rating')
    }
  }

  useEffect(()=>{
    if (!previewUrl) {
      getCourseProgress();
    }
  },[previewUrl])
  return courseData?(
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
                              src={progressData?.lectureCompleted?.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                              alt="play"
                              className="w-5 h-5 opacity-70"
                            />
                            <p className="text-base md:text-xl text-gray-700 font-medium">
                              {lecture.lectureTitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm md:text-lg">
                            {lecture.lectureUrl && !previewUrl && (
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

          {!previewUrl && (
            <div className='flex items-center gap-2 py-3 mt-10'>
              <h1 className='text-2xl font-bold'>Rate this course:</h1>
              <Rating initialRating={initialRating} onRate={handleRate}/>
            </div>
          )}
        </div>

        {/* right clm */}

        <div className='md:mt-10'>
          {playerData?(<div>
            {(playerData.lectureUrl?.includes('youtube.com') || playerData.lectureUrl?.includes('youtu.be')) ? (
              <YouTube videoId={getYouTubeVideoId(playerData.lectureUrl)}  iframeClassName='aspect-video w-full' />
            ) : (
              <video 
                src={playerData.lectureUrl} 
                controls 
                className='aspect-video w-full rounded-lg'
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            )}
            <div className='flex justify-between items-center mt-1'>
              <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
              {!previewUrl && (
                <button onClick={()=>markLectureComplete(playerData.lectureId)} className='text-blue-600'>{progressData?.lectureCompleted?.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}</button>
              )}
            </div>
          </div>)
          :
          ((courseData?.courseThumbnail || '').trim()
            ? <img src={courseData.courseThumbnail} alt='' className='w-full rounded-lg' />
            : null)}
        </div>
      </div>
      <Footer />
    </>
  ):<Loading />
}

export default Player
