import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t">
      <div className="flex items-center gap-6">
        <img
          className="hidden md:block w-25 h-10"
          src={assets.logo}
          alt="logo"
        />
        <div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
        <p className="py-4 text-center text-xl md:text-xl text-gray-500 ">
          Copyright 2025 © GreatStack. All Right Reserved.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <a href="#" aria-label="Facebook">
          <img src={assets.facebook_icon} alt="facebook_icon" />
        </a>

        <a href="#" aria-label="Twitter">
          <img src={assets.twitter_icon} alt="twitter_icon" />
        </a>

        <a href="#" aria-label="Instagram">
          <img src={assets.instagram_icon} alt="instagram_icon" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
