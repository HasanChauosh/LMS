import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 w-full mt-auto">
      
      <div className="w-[90%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">

        {/* Brand Section */}
        <div className="flex flex-col gap-5"> 
          <div className="flex items-center gap-4">
            <img src={assets.logo} alt="ApexLearn Logo" className="w-28 h-auto" />
            <span className="text-4xl font-bold text-white">
              ApexLearn
            </span>
          </div>

          <p className="text-2xl leading-relaxed text-gray-400">
            Edemy is a modern learning platform designed to make education
            simple, accessible, and effective. Learn at your own pace,
            gain practical skills, and grow with confidence—anytime,
            anywhere.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-white font-bold mb-6 text-3xl">Company</h4>
          <ul className="space-y-4 text-xl">
            <li className="hover:text-white transition cursor-pointer">Home</li>
            <li className="hover:text-white transition cursor-pointer">About Us</li>
            <li className="hover:text-white transition cursor-pointer">Contact Us</li>
            <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold mb-6 text-3xl">
            Subscribe to our newsletter
          </h4>
          <p className="text-2xl text-gray-400 mb-6 leading-relaxed">
            Get the latest updates, courses, and learning tips delivered to your inbox.
          </p>
          <div className="flex w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-l-md bg-gray-800 text-xl outline-none text-gray-300 placeholder-gray-500"
            />
            <button className="bg-blue-600 px-6 py-3 rounded-r-md text-white text-xl font-medium hover:bg-blue-700 transition">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Copyright Divider */}
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xl text-gray-500">
        © 2025 Edemy. All Rights Reserved.
      </div>

    </footer>
  )
}

export default Footer;