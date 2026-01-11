import { createContext, use } from "react";
import { dummyCourses } from "../assets/assets";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

const AppContext = createContext();

export default AppContext;

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY || 'USD';
    const navigate = useNavigate();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    //fech all courses from backend
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    }

    //function to cal all rating of the course
    const calculateCourseRating = (course) => {
        if (!course.courseRatings || course.courseRatings.length === 0) return 0;

        let totalRating = 0;

        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });

        return (totalRating / course.courseRatings.length).toFixed(1);
    };

    //function to cal course chapter time
    const calculateChapterTime = (chapter) => {
        let totalTime = 0;
        chapter.chapterContent.map((lecture) => {
            totalTime += lecture.lectureDuration;
        });
        return humanizeDuration(totalTime * 60 * 1000, { units: ['h', 'm']});
    };

    //function to calculate the course duration
    const calculateCourseDuration = (course) => {
        let totalDuration = 0;
        course.courseContent.map((chapter) => {
            chapter.chapterContent.map((lecture) => {
                totalDuration += lecture.lectureDuration;
            });
        });
        return humanizeDuration(totalDuration * 60 * 1000, { units: ['h', 'm']});
    };

    //function to calculate total lectures in a course
    const calculateTotalLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    //fetch User enrolled courses
    const fetchUserEnrolledCourses = async () => {
        //fetch from backend
        setEnrolledCourses(dummyCourses);
    }


    useEffect(() => {
        fetchAllCourses();
        fetchUserEnrolledCourses();
    }, []);
    const value = { currency, allCourses, navigate, calculateCourseRating, isEducator, setIsEducator, calculateChapterTime, 
        calculateCourseDuration, calculateTotalLectures, enrolledCourses, fetchUserEnrolledCourses };
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}