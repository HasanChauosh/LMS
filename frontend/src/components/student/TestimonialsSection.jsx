import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialsSection = () => {
  return (
    // CHANGED: Reduced top padding (pt-14) to fix "too much upside space"
    // Kept bottom padding (pb-24) to keep it spacious from the footer/CTA
    <div className='pb-24 pt-14 px-8 md:px-16 w-full bg-white'>
      
      {/* Heading Section */}
      <div className='max-w-5xl mx-auto text-center mb-16'>
        <h2 className='text-4xl font-bold text-gray-800 mb-6'>
          Testimonials
        </h2>
        <p className='text-2xl text-gray-500 leading-relaxed'>
          Hear from our learners as they share their journey of success and growth, 
          and how our platform has played a pivotal role in their achievements.
        </p>
      </div>

      {/* Grid Container */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full'>
        {dummyTestimonial.map((testimonial, index) => (
          <div 
            key={index} 
            className='flex flex-col text-left p-10 border border-gray-100 rounded-3xl bg-gray-50 
                       shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'
          >
            
            {/* Header: Profile Image & Name/Role */}
            <div className='flex items-center gap-6 mb-8'>
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className='w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm' 
              />
              <div>
                <h3 className='text-gray-900 font-bold text-2xl'>
                  {testimonial.name}
                </h3>
                <p className='text-blue-600 font-medium text-lg'>
                  {testimonial.role}
                </p>
              </div>
            </div>

            {/* Ratings Section */}
            <div className='flex gap-1.5 mb-6'>
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < testimonial.rating ? assets.star : assets.star_blank}
                  alt="star"
                  className='w-6 h-6' 
                />
              ))}
            </div>

            {/* Feedback Section */}
            <p className='text-gray-700 leading-8 text-xl flex-grow mb-8'>
              "{testimonial.feedback}"
            </p>

            {/* Read More Link */}
            <div className='mt-auto'>
                <a href="#" className='text-blue-600 font-bold text-lg hover:underline underline-offset-4 decoration-2'>
                    Read Success Story →
                </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialsSection