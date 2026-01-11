import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
  return (
    // Added a very light blue background (bg-blue-50/30) for a subtle splash of color
    <div className='pt-24 pb-16 bg-blue-50/30'> 
      
      <p className='text-center text-2xl text-gray-600 font-semibold mb-12'>
        Trusted by learners from top companies
      </p>

      {/* Logos are now Full Color by default */}
      <div className='flex flex-wrap items-center justify-center gap-16 md:gap-28 px-10'>
        
        <img 
          src={assets.microsoft_logo} 
          alt="Microsoft" 
          // Removed 'grayscale'. Added drop-shadow for depth.
          className='w-28 md:w-36 lg:w-44 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-sm' 
        />
        
        <img 
          src={assets.walmart_logo} 
          alt="Walmart" 
          className='w-28 md:w-36 lg:w-44 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-sm' 
        />
        
        <img 
          src={assets.accenture_logo} 
          alt="Accenture" 
          className='w-28 md:w-36 lg:w-44 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-sm' 
        />
        
        <img 
          src={assets.adobe_logo} 
          alt="Adobe" 
          className='w-28 md:w-36 lg:w-44 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-sm' 
        />
        
        <img 
          src={assets.paypal_logo} 
          alt="PayPal" 
          className='w-28 md:w-36 lg:w-44 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-sm' 
        />
        
      </div>
    </div>
  )
}

export default Companies