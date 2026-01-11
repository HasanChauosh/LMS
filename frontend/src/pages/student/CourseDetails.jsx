import React from 'react'
import { useParams } from 'react-router-dom'
import { useContext } from 'react'
import AppContext from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/student/Footer'

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = React.useState(null);
  const [openSections, setOpenSections] = React.useState([]);
  const {
    allCourses,
    calculateCourseRating,
    calculateChapterTime,
    currency,
    calculateCourseDuration,
    calculateTotalLectures,
  } = useContext(AppContext);

  const fetchCourseData = async () => {
    if (!allCourses || allCourses.length === 0) {
      setCourseData(null);
      return;
    }
    const findcourse = allCourses.find((course) => String(course._id) === String(id));
    setCourseData(findcourse || null);
  };

  React.useEffect(() => {
    fetchCourseData();
  }, [id, allCourses]);

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  };

  return courseData ? (
    <>
      {/* LAYOUT UPDATE: 
          - Changed to a simple flex container.
          - No justify-between. We will control position with column widths. 
      */}
      <div className="flex flex-col lg:flex-row gap-10 relative w-full px-8 lg:px-20 py-12 md:py-16">
        
        {/* background */}
        <div className="absolute top-0 left-0 w-full h-[500px] -z-10 bg-gradient-to-b from-[#e8f3ff] to-white"></div>

        {/* --- LEFT COLUMN (50% Width) --- */}
        {/* Allows the right side to have the other 50% for centering */}
        <div className="w-full lg:w-[50%] text-gray-800 text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {courseData.courseTitle}
          </h1>

          <p
            className="text-base md:text-2xl text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: (courseData.courseDescription || '').slice(0, 360),
            }}
          ></p>

          {/* Review and Ratings */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-base md:text-lg text-gray-700">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-2xl">
                {calculateCourseRating(courseData)}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={
                      i < Math.floor(calculateCourseRating(courseData))
                        ? assets.star
                        : assets.star_blank
                    }
                    alt=""
                    className="w-6 h-6"
                  />
                ))}
              </div>
            </div>

            <p className="text-blue-600 font-medium underline text-lg md:text-xl">
              ({courseData.courseRatings.length} Ratings)
            </p>
            <p className="text-gray-500 text-lg md:text-xl">
              {courseData.enrolledStudents.length} Students
            </p>
          </div>

          <p className="mt-4 text-2xl md:text-xl">
            Course by{' '}
            <span className="font-bold text-2xl text-blue-800 underline cursor-pointer">
              ApexLearn
            </span>
          </p>

          {/* Course Structure */}
          <div className="pt-12 text-gray-700">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
              Course Structure
            </h2>
            <div className="space-y-4">
              {courseData.courseContent.map((chapter, index) => (
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
                        className={`w-5 h-5 transform transition-transform duration-200 ${
                          openSections.includes(index) ? 'rotate-180' : ''
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
                                src={assets.play_icon}
                                alt="play"
                                className="w-5 h-5 opacity-70"
                              />
                              <p className="text-base md:text-xl text-gray-700 font-medium">
                                {lecture.lectureTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm md:text-lg">
                              {lecture.isPreviewFree && (
                                <span className="text-blue-600 font-bold cursor-pointer hover:underline">
                                  Preview
                                </span>
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
          </div>

          {/* Description */}
          <div className="py-12">
            <h3 className="text-xl md:text-5xl font-bold text-gray-900 mb-6">
              Course Description
            </h3>
            <p
              className="rich-text text-base md:text-3xl text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription,
              }}
            ></p>
          </div>
        </div>

        {/* --- RIGHT COLUMN (50% Width) --- */}
        {/* - lg:w-[50%] : Takes up the entire right half of the container.
           - justify-center : Moves the card to the CENTER of this right half (fixing the "move left" issue).
           - items-start : Keeps the card sticky at the top.
        */}
        <aside className="w-full lg:w-[50%] relative flex justify-center items-start">
          
          {/* CARD CONTAINER */}
          {/* Changed max-w from 420px to 500px to make it WIDER */}
          <div className="sticky top-10 w-full max-w-[500px]">
            <div className="w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative">
                <img
                  src={courseData.courseThumbnail}
                  alt="course thumbnail"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {/* Increased padding (py-10) to make it TALLER/LENGTHIER */}
              <div className="p-6 md:p-10 text-[17px] md:text-lg">
                <div className="flex items-center gap-3 mb-5 bg-red-50 p-3 rounded w-fit">
                  <img
                    src={assets.time_left_clock_icon}
                    alt="time left"
                    className="w-5 h-5"
                  />
                  <p className="text-base md:text-lg text-red-600 font-bold">
                    5 days left at this price!
                  </p>
                </div>

                <div className="flex items-end gap-3 mb-6">
                  {(() => {
                    const code = currency || 'USD';
                    const price =
                      (courseData.coursePrice || 0) -
                      ((courseData.courseDiscount || 0) *
                        (courseData.coursePrice || 0)) /
                        100;
                    return (
                      <p className="text-4xl md:text-5xl font-extrabold text-gray-900">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: code,
                        }).format(price)}
                      </p>
                    );
                  })()}
                  <span className="text-xl md:text-2xl text-gray-400 line-through mb-1">
                    ${courseData.coursePrice}
                  </span>
                  <span className="text-base md:text-xl text-gray-600 font-bold mb-1 ml-1">
                    {courseData.courseDiscount}% off
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm md:text-base text-gray-600 mb-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <img src={assets.star} className="w-5 h-5" alt="" />
                    <span className="font-bold text-gray-900">
                      {calculateCourseRating(courseData)}
                    </span>
                  </div>
                  <div className="w-px h-5 bg-gray-300"></div>
                  <div className="flex items-center gap-1.5">
                    <img src={assets.time_clock_icon} className="w-5 h-5" alt="" />
                    <span>{calculateCourseDuration(courseData)}</span>
                  </div>
                  <div className="w-px h-5 bg-gray-300"></div>
                  <div className="flex items-center gap-1.5">
                    <img src={assets.lesson_icon} className="w-5 h-5" alt="" />
                    <span>{calculateTotalLectures(courseData)} lectures</span>
                  </div>
                </div>

                <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-xl md:text-2xl text-white font-bold rounded-lg shadow-lg transition-all mb-8">
                  Enroll Now
                </button>

                <div className="pt-6">
                  <p className="font-bold text-gray-900 text-xl md:text-3xl mb-6">
                    What's in the course?
                  </p>
                  <ul className="space-y-4">
                    {[
                      'Lifetime access with free updates',
                      'Step-by-step guidance',
                      'Downloadable resources',
                      'Quizzes to test knowledge',
                      'Certificate of completion',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {/* TEXT UPDATE: text-xl to text-2xl as requested */}
                        <span className="text-blue-500 font-bold text-2xl">✓</span>
                        <span className="text-xl md:text-2xl text-gray-600 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;