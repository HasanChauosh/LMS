import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
    <div className="flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0">
      
      {/* Heading - Huge text, tight spacing */}
      <h1 className="text-xl md:text-5xl font-bold text-gray-800">
        Ready to start learning?
      </h1>

      {/* Subtext - Updated to be more engaging */}
      <p className="text-gray-500 sm:text-lg md:text-2xl text-center mb-8 ">
        Join our community of world-class learners and start achieving your goals today.
      </p>

      {/* Buttons Container */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
        
        {/* Primary Button - Large and Bold */}
        <button className="bg-blue-600 hover:bg-blue-700 transition duration-300 
                           text-white text-xl font-semibold px-10 py-4 rounded-md shadow-md">
          Get Started Now
        </button>

        {/* Secondary Button */}
        <button className="flex items-center gap-3 text-xl font-medium text-gray-700 hover:text-blue-600 transition duration-300">
          Learn More
          <img src={assets.arrow_icon} alt="arrow icon" className="w-5 h-5" />
        </button>

      </div>

    </div>
  )
}

export default CallToAction