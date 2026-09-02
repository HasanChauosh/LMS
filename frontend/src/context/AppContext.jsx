import { createContext, use } from "react";
import { dummyCourses } from "../assets/assets";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
const AppContext = createContext();
import { toast } from "react-toastify";

export default AppContext;

export const AppContextProvider = (props) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const currency = import.meta.env.VITE_CURRENCY || 'USD';
    const navigate = useNavigate();

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);
    const [accountStatus, setAccountStatus] = useState('loading');
    //fech all courses from backend
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendURL + '/api/course/all');
            if (data.success) {
                setAllCourses(data.courses);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    //fetch user data from backend
    const fetchUserData = async () => {
        if (user.publicMetadata.role === 'educator') {
            setIsEducator(true);
        }
        try {
            const token = await getToken();
            const { data } = await axios.get(backendURL + '/api/user/data', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data.success) {
                setUserData(data.user);
                setAccountStatus('ready');
            } else {
                setUserData(null);
                setAccountStatus('missing');
            }
        }
        catch (error) {
            const status = error?.response?.status;
            setUserData(null);
            setAccountStatus(status === 401 || status === 404 ? 'missing' : 'error');
            if (status !== 401 && status !== 404) {
                toast.error(error.message);
            }
        }
    }

    //function to cal all rating of the course
    const calculateCourseRating = (course) => {
        if (!course || !Array.isArray(course.courseRatings) || course.courseRatings.length === 0) return 0;

        let totalRating = 0;

        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });

        return Math.floor(totalRating / course.courseRatings.length);
    };

    //function to cal course chapter time
    const calculateChapterTime = (chapter) => {
        let totalTime = 0;
        chapter.chapterContent.map((lecture) => {
            totalTime += lecture.lectureDuration;
        });
        return humanizeDuration(totalTime * 60 * 1000, { units: ['h', 'm'] });
    };

    //function to calculate the course duration
    const calculateCourseDuration = (course) => {
        let totalDuration = 0;
        course.courseContent.map((chapter) => {
            chapter.chapterContent.map((lecture) => {
                totalDuration += lecture.lectureDuration;
            });
        });
        return humanizeDuration(totalDuration * 60 * 1000, { units: ['h', 'm'] });
    };

    //function to calculate total lectures in a course
    const calculateTotalLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    //fetch User enrolled courses
    const fetchUserEnrolledCourses = async () => {
        //fetch from backend
        if (!user || accountStatus !== 'ready') return; // Don't fetch until the account is synced
        try {
            const token = await getToken();
            const { data } = await axios.get(backendURL + '/api/user/enrolled-courses', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (data.success) {
                setEnrolledCourses(data.courses.reverse());
            } else {
                setEnrolledCourses([]);
            }
        } catch (error) {
            console.error('fetchUserEnrolledCourses error:', error);
            const status = error?.response?.status;
            if (status !== 401 && status !== 404) {
                toast.error(error.message);
            }
        }
    }


    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user])

    useEffect(() => {
        if (user && accountStatus === 'ready') {
            fetchUserEnrolledCourses();
        }
    }, [user, accountStatus]);
    const value = {
        currency, allCourses, navigate, calculateCourseRating, isEducator, setIsEducator, calculateChapterTime,
        calculateCourseDuration, calculateTotalLectures, enrolledCourses, fetchUserEnrolledCourses, userData, fetchUserData, backendURL, getToken, setUserData, accountStatus
    };
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}