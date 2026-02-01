import express from 'express'
import { getUserData, purchaseCourses, userEnrolledCourses, } from '../controllers/userController.js'

const userRouter= express.Router();

userRouter.get('/data',getUserData);
userRouter.get('/enrolled-courses',userEnrolledCourses);
userRouter.post('/purchase',purchaseCourses);
export default userRouter;