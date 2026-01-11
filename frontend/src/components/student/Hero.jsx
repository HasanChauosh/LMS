import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full pt-24 md:pt-48 pb-24 px-6 md:px-0 space-y-12 text-center bg-gradient-to-b from-cyan-100/70 via-white to-white">

            {/* Main Headline - Massive Size */}
            <h1 className="text-4xl md:text-7xl font-bold text-gray-800 max-w-5xl mx-auto leading-tight relative">
                Empower your future with the courses designed to 
                <span className="text-blue-600 relative inline-block ml-3">
                     fit your choice.
                     {/* Decorative Sketch - Adjusted position for larger text */}
                     <img
                        src={assets.sketch}
                        alt="sketch"
                        className="w-24 md:w-56 absolute -bottom-4 md:-bottom-8 right-0"
                    />
                </span>
            </h1>

            {/* Subtitle - Increased to text-2xl for better readability */}
            <p className="md:block hidden text-gray-500 max-w-4xl mx-auto text-xl md:text-2xl leading-relaxed">
                We bring together world-class instructors, interactive content, and a
                supportive community to help you achieve your personal and professional goals.
            </p>

            {/* Mobile Subtitle - Slightly larger text for mobile too */}
            <p className="md:hidden text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">
                We bring together world-class instructors to help you achieve your professional goals.
            </p>

            {/* Search Bar Container - Ensure it has space */}
            <div className="w-full flex justify-center pt-4">
                <SearchBar/>
            </div>

        </div>

    )
}

export default Hero