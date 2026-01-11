import React, { useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; 
import { assets } from '../../assets/assets';

const AddCourse = () => {
  const quillRef = useRef();
  const editorRef = useRef();

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [image, setImage] = useState('');
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState('');
  const [lectureDetails, setLectureDetails] = useState({ 
    lectureTitle: '', 
    lectureDuration: '', 
    lectureUrl: '', 
    isPreviewFree: false, 
  });

  useEffect(() => {
    // Only initialize if it hasn't been already
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: 'Write a compelling course description...',
      });
    }
  }, []);

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter(ch => ch.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(chapters.map(ch => ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch));
    }
  };

  const handleAddLecture = () => {
    if (!currentChapterId) return;
    const newLecture = {
      lectureTitle: lectureDetails.lectureTitle || 'Untitled Lecture',
      lectureDuration: lectureDetails.lectureDuration || 0,
      lectureUrl: lectureDetails.lectureUrl || '#',
      isPreviewFree: !!lectureDetails.isPreviewFree,
    };

    setChapters(prev => prev.map(ch => {
      if (ch.chapterId === currentChapterId) {
        return { ...ch, chapterContent: [...ch.chapterContent, newLecture] };
      }
      return ch;
    }));

    setLectureDetails({ lectureTitle: '', lectureDuration: '', lectureUrl: '', isPreviewFree: false });
    setCurrentChapterId('');
    setShowPopup(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10'>
        
        {/* Header */}
        <div className='mb-10 border-b border-gray-100 pb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Create Course</h1>
          <p className='text-gray-500 mt-1'>Fill in the details below to launch your course.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className='space-y-8'>
          
          {/* Title - Balanced xl size */}
          <div className="space-y-2">
            <label className='text-xl font-semibold text-gray-800'>Course Title</label>
            <input
              onChange={e => setCourseTitle(e.target.value)}
              value={courseTitle}
              type="text"
              placeholder="e.g. Fullstack MERN Mastery"
              className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              required
            />
          </div>

          {/* Description - Fixed Placeholder Bleed */}
          <div className="space-y-2">
            <label className='text-xl font-semibold text-gray-800'>Course Description</label>
            <div className='rounded-xl border border-gray-300 overflow-hidden relative'>
                <div ref={editorRef} className='min-h-[200px] text-base'></div>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className='text-lg font-semibold text-gray-800'>Price ($)</label>
              <input
                onChange={e => setCoursePrice(e.target.value)}
                value={coursePrice}
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className='text-lg font-semibold text-gray-800'>Discount (%)</label>
              <input
                onChange={e => setDiscount(e.target.value)}
                value={discount}
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className='text-lg font-semibold text-gray-800'>Thumbnail</label>
              <label htmlFor="thumbnailImage" className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-all border border-blue-200">
                <img src={assets.file_upload_icon} alt="" className="w-5" />
                <span className='font-semibold'>{image ? "Change Image" : "Upload Image"}</span>
                <input type="file" id="thumbnailImage" onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
              </label>
              {image && <img src={URL.createObjectURL(image)} alt="" className="mt-2 h-16 w-28 object-cover rounded-lg border shadow-sm" />}
            </div>
          </div>

          {/* Curriculum */}
          <div className='pt-6'>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='text-2xl font-bold text-gray-900'>Course Curriculum</h3>
                <button type="button" onClick={() => handleChapter('add')} className='text-blue-600 font-bold hover:underline'>
                    + Add Chapter
                </button>
            </div>

            <div className='space-y-4'>
              {chapters.map((chapter, chapterIndex) => (
                <div key={chapter.chapterId} className='border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm'>
                  
                  {/* Chapter Header */}
                  <div className='flex justify-between items-center p-5 bg-gray-50/50'>
                    <div className='flex items-center gap-3 cursor-pointer group' onClick={() => handleChapter('toggle', chapter.chapterId)}>
                      <img 
                        src={assets.dropdown_icon} 
                        alt="" 
                        className={`w-3 transition-transform ${chapter.collapsed ? '-rotate-90' : ''}`} 
                      />
                      <span className='text-lg font-bold text-gray-800'>
                        {chapterIndex + 1}. {chapter.chapterTitle}
                      </span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='text-sm font-semibold text-gray-500'>
                        {chapter.chapterContent.length} Lectures
                      </span>
                      <img 
                        src={assets.cross_icon} 
                        alt="remove" 
                        className='w-4 cursor-pointer opacity-40 hover:opacity-100' 
                        onClick={() => handleChapter('remove', chapter.chapterId)} 
                      />
                    </div>
                  </div>

                  {/* Chapter Content */}
                  {!chapter.collapsed && (
                    <div className="p-6 bg-white space-y-3">
                      {chapter.chapterContent.map((lecture, lectureIndex) => (
                        <div key={lectureIndex} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50 group">
                          <div className='flex items-center gap-4'>
                            <span className='text-gray-400 font-bold'>{lectureIndex + 1}</span>
                            <div>
                                <p className='font-semibold text-gray-800'>{lecture.lectureTitle}</p>
                                <p className='text-sm text-gray-500'>{lecture.lectureDuration} mins • {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</p>
                            </div>
                          </div>
                          <img src={assets.cross_icon} alt="remove" className="w-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                              setChapters(prev => prev.map(ch => ch.chapterId === chapter.chapterId ? { ...ch, chapterContent: ch.chapterContent.filter((_, idx) => idx !== lectureIndex) } : ch));
                            }} 
                          />
                        </div>
                      ))}
                      <button 
                        type='button'
                        onClick={() => { setCurrentChapterId(chapter.chapterId); setShowPopup(true); }}
                        className='w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all'
                      >
                        + Add Lecture
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className='pt-8'>
            <button type='submit' className='w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-700 transition-all'>
              PUBLISH COURSE
            </button>
          </div>
        </form>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className='bg-white p-8 rounded-3xl shadow-xl relative w-full max-w-md'>
            <div className='flex justify-between items-center mb-6'>
               <h2 className='text-2xl font-bold text-gray-900'>Add Lecture</h2>
               <img src={assets.cross_icon} alt="close" className='w-5 cursor-pointer' onClick={() => setShowPopup(false)} />
            </div>
            <div className='space-y-4'>
              <div className='space-y-1'>
                <p className='font-semibold text-gray-700'>Lecture Title</p>
                <input type='text' className='w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none' value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <p className='font-semibold text-gray-700'>Duration (min)</p>
                  <input type='number' className='w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none' value={lectureDetails.lectureDuration} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })} />
                </div>
                <div className='flex items-center gap-2 pt-6'>
                   <input id='preview' type='checkbox' className='w-5 h-5 accent-blue-600' checked={!!lectureDetails.isPreviewFree} onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })} />
                   <label htmlFor='preview' className='font-semibold text-gray-700'>Free Preview</label>
                </div>
              </div>
              <div className='space-y-1'>
                <p className='font-semibold text-gray-700'>Lecture URL</p>
                <input type='text' className='w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none' value={lectureDetails.lectureUrl} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })} />
              </div>
              <div className='flex gap-3 pt-4'>
                <button type='button' className='flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700' onClick={handleAddLecture}>Add</button>
                <button type='button' className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200' onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;