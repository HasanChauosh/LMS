import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-14 pb-6 w-full">
      
      {/* Top Section */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-14">

        {/* Brand */}
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-3">
            <img src={assets.logo} alt="ApexLearn Logo" className="w-24 h-auto" />
            <span className="text-2xl font-semibold text-white">
              ApexLearn
            </span>
          </div>

          <p className="text-base leading-7 text-gray-400 text">
            Edemy is a modern learning platform designed to make education
            simple, accessible, and effective. Learn at your own pace,
            gain practical skills, and grow with confidence—anytime,
            anywhere.
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Company</h4>
          <ul className="space-y-2 text-base">
            <li className="hover:text-white transition cursor-pointer">Home</li>
            <li className="hover:text-white transition cursor-pointer">About Us</li>
            <li className="hover:text-white transition cursor-pointer">Contact Us</li>
            <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">
            Subscribe to our newsletter
          </h4>
          <p className="text-base text-gray-400 mb-4 leading-7">
            Get the latest updates, courses, and learning tips delivered to your inbox.
          </p>
          <div className="flex max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 rounded-l-md bg-gray-800 text-sm outline-none text-gray-300 placeholder-gray-500"
            />
            <button className="bg-blue-600 px-5 py-2.5 rounded-r-md text-white text-sm hover:bg-blue-700 transition">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
        © 2025 Edemy. All Rights Reserved.
      </div>

    </footer>
  )
}

export default Footer
