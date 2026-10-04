import React, { useEffect, useRef, useState } from 'react';
// use a browser-safe id generator
import { nanoid } from 'nanoid';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import AppContext from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as UpChunk from '@mux/upchunk';

const AddCourse = () => {
  const { backendURL ,getToken} = useContext(AppContext);
  const quillRef = useRef();
  const editorRef = useRef();

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [image, setImage] = useState('');
  const [chapters, setChapters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState('');
  // Lecture form state.
  // videoProvider chooses between the two sources the educator can use:
  //   'mux'     -> local file uploaded through Mux (recommended for paid content)
  //   'youtube' -> a YouTube URL (free / already-public content)
  // uploadStatus flow (mux only): 'idle' -> 'uploading' -> 'done' | 'error'
  const initialLectureDetails = {
    lectureTitle: '',
    isPreviewFree: false,
    videoProvider: 'mux',
    // youtube source
    videoUrl: '',
    lectureDuration: '',
    // mux source
    muxUploadId: '',
    uploadStatus: 'idle',
    uploadProgress: 0,
    uploadError: '',
  };

  const [lectureDetails, setLectureDetails] = useState(initialLectureDetails);
  const resetLectureDetails = () => setLectureDetails(initialLectureDetails);

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
          chapterId: nanoid(),
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

  // Ask backend for a Mux upload URL, then push the file directly to Mux with UpChunk.
  // We do NOT store the video on our server — only the uploadId returned by Mux.
  const handleVideoSelect = async (file) => {
    if (!file) return;
    setLectureDetails(prev => ({
      ...prev,
      muxUploadId: '',
      uploadStatus: 'uploading',
      uploadProgress: 0,
      uploadError: '',
    }));

    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendURL + '/api/mux/uploads',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) throw new Error(data.message || 'Failed to create upload');

      const upload = UpChunk.createUpload({
        endpoint: data.uploadUrl,
        file,
        chunkSize: 5120, // 5MB chunks
      });

      upload.on('progress', (e) => {
        setLectureDetails(prev => ({ ...prev, uploadProgress: Math.round(e.detail) }));
      });

      upload.on('success', () => {
        setLectureDetails(prev => ({
          ...prev,
          uploadStatus: 'done',
          uploadProgress: 100,
          muxUploadId: data.uploadId,
        }));
        toast.success('Video uploaded — Mux is now processing it.');
      });

      upload.on('error', (e) => {
        setLectureDetails(prev => ({
          ...prev,
          uploadStatus: 'error',
          uploadError: e.detail?.message || 'Upload failed',
        }));
        toast.error('Upload failed: ' + (e.detail?.message || 'unknown error'));
      });
    } catch (error) {
      setLectureDetails(prev => ({
        ...prev,
        uploadStatus: 'error',
        uploadError: error?.response?.data?.message || error.message,
      }));
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleAddLecture = () => {
    if (!currentChapterId) return;

    const chapter = chapters.find(ch => ch.chapterId === currentChapterId);
    const orderIdx = chapter ? chapter.chapterContent.length + 1 : 1;

    let newLecture;

    if (lectureDetails.videoProvider === 'mux') {
      // A Mux lecture is only valid once the file has finished uploading.
      if (lectureDetails.uploadStatus !== 'done' || !lectureDetails.muxUploadId) {
        toast.error('Please upload a video before adding the lecture.');
        return;
      }
      newLecture = {
        lectureId: nanoid(),
        lectureTitle: lectureDetails.lectureTitle || 'Untitled Lecture',
        isPreviewFree: !!lectureDetails.isPreviewFree,
        lectureOrder: orderIdx,
        videoProvider: 'mux',
        muxUploadId: lectureDetails.muxUploadId,
        videoStatus: 'processing', // updated to 'ready' by the Mux webhook
        lectureDuration: 0,        // filled in by the Mux webhook
      };
    } else {
      // YouTube source — validate URL, duration is educator-entered.
      const url = (lectureDetails.videoUrl || '').trim();
      if (!url) {
        toast.error('Please paste a YouTube URL.');
        return;
      }
      const isYouTube = /youtu\.be|youtube\.com/i.test(url);
      if (!isYouTube) {
        toast.error('That does not look like a YouTube URL.');
        return;
      }
      newLecture = {
        lectureId: nanoid(),
        lectureTitle: lectureDetails.lectureTitle || 'Untitled Lecture',
        isPreviewFree: !!lectureDetails.isPreviewFree,
        lectureOrder: orderIdx,
        videoProvider: 'youtube',
        lectureUrl: url,
        videoStatus: 'ready',       // no processing step for YouTube
        lectureDuration: Number(lectureDetails.lectureDuration) || 0,
      };
    }

    setChapters(prev => prev.map(ch => {
      if (ch.chapterId === currentChapterId) {
        return { ...ch, chapterContent: [...ch.chapterContent, newLecture] };
      }
      return ch;
    }));

    resetLectureDetails();
    setCurrentChapterId('');
    setShowPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!image) {
        toast.error('Please upload a thumbnail image');
        return;
      }

      if (!courseTitle.trim()) {
        toast.error('Please add course title');
        return;
      }

      if (!chapters.length) {
        toast.error('Please add at least one chapter');
        return;
      }

      const courseDescription = quillRef.current?.root?.innerHTML || '';

      const courseData = {
        courseTitle: courseTitle.trim(),
        courseDescription,
        coursePrice: Number(coursePrice) || 0,
        discount: Number(discount) || 0,
        courseContent: chapters.map((chapter, chapterIndex) => ({
          chapterId: chapter.chapterId,
          chapterTitle: chapter.chapterTitle,
          chapterOrder: chapter.chapterOrder || chapterIndex + 1,
          chapterContent: chapter.chapterContent.map((lecture, lectureIndex) => ({
            lectureId: lecture.lectureId || nanoid(),
            lectureTitle: lecture.lectureTitle,
            isPreviewFree: !!lecture.isPreviewFree,
            lectureOrder: lecture.lectureOrder || lectureIndex + 1,
            videoProvider: lecture.videoProvider || 'mux',
            // youtube path
            lectureUrl: lecture.lectureUrl || '',
            // mux path — muxAssetId / muxPlaybackId / lectureDuration are set later by the Mux webhook
            muxUploadId: lecture.muxUploadId || '',
            videoStatus: lecture.videoStatus || (lecture.videoProvider === 'youtube' ? 'ready' : 'processing'),
            lectureDuration: Number(lecture.lectureDuration) || 0,
          })),
        })),
      };

      const formData = new FormData();
      formData.append('image', image);
      formData.append('courseData', JSON.stringify(courseData));

      const token = await getToken();
      const { data } = await axios.post(backendURL + '/api/educator/add-course', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success(data.message || 'Course published successfully');
        setCourseTitle('');
        setCoursePrice('');
        setDiscount('');
        setImage('');
        setChapters([]);
        if (quillRef.current?.root) {
          quillRef.current.root.innerHTML = '';
        }
      } else {
        toast.error(data.message || 'Failed to publish course');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to publish course');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10'>
        
        {/* Header */}
        <div className='mb-10 border-b border-gray-100 pb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Create Course</h1>
          <p className='text-gray-500 mt-1'>Fill in the details below to launch your course.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          
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
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-700 transition-all'
            >
              {isSubmitting ? 'PUBLISHING...' : 'PUBLISH COURSE'}
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
              <img
                src={assets.cross_icon}
                alt="close"
                className='w-5 cursor-pointer'
                onClick={() => { resetLectureDetails(); setShowPopup(false); }}
              />
            </div>

            <div className='space-y-4'>
              {/* Title */}
              <div className='space-y-1'>
                <p className='font-semibold text-gray-700'>Lecture Title</p>
                <input
                  type='text'
                  className='w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none'
                  value={lectureDetails.lectureTitle}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                />
              </div>

              {/* Free Preview */}
              <div className='flex items-center gap-2'>
                <input
                  id='preview'
                  type='checkbox'
                  className='w-5 h-5 accent-blue-600'
                  checked={!!lectureDetails.isPreviewFree}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                />
                <label htmlFor='preview' className='font-semibold text-gray-700'>Free Preview</label>
              </div>

              {/* Video source selector — Upload (Mux) or YouTube URL */}
              <div className='space-y-2'>
                <p className='font-semibold text-gray-700'>Video Source</p>
                <div className='grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl'>
                  <button
                    type='button'
                    onClick={() => setLectureDetails(prev => ({ ...prev, videoProvider: 'mux' }))}
                    className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                      lectureDetails.videoProvider === 'mux'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    Upload video
                  </button>
                  <button
                    type='button'
                    onClick={() => setLectureDetails(prev => ({ ...prev, videoProvider: 'youtube' }))}
                    className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                      lectureDetails.videoProvider === 'youtube'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    YouTube URL
                  </button>
                </div>
              </div>

              {/* Mux upload UI */}
              {lectureDetails.videoProvider === 'mux' && (
                <div className='space-y-2'>
                  {lectureDetails.uploadStatus === 'idle' && (
                    <label htmlFor='lectureVideo' className='flex items-center justify-center gap-3 px-4 py-4 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 border border-blue-200'>
                      <img src={assets.file_upload_icon} alt='' className='w-5' />
                      <span className='font-semibold'>Choose video file</span>
                      <input
                        id='lectureVideo'
                        type='file'
                        accept='video/*'
                        hidden
                        onChange={(e) => handleVideoSelect(e.target.files?.[0])}
                      />
                    </label>
                  )}

                  {lectureDetails.uploadStatus === 'uploading' && (
                    <div className='p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-2'>
                      <p className='text-sm font-semibold text-blue-700'>Uploading to Mux… {lectureDetails.uploadProgress}%</p>
                      <div className='w-full h-2 bg-blue-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-blue-600 transition-all'
                          style={{ width: `${lectureDetails.uploadProgress}%` }}
                        />
                      </div>
                      <p className='text-xs text-blue-500'>Keep this tab open until it finishes.</p>
                    </div>
                  )}

                  {lectureDetails.uploadStatus === 'done' && (
                    <div className='p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-semibold text-sm'>
                      ✅ Upload complete. Mux is processing it in the background.
                    </div>
                  )}

                  {lectureDetails.uploadStatus === 'error' && (
                    <div className='p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm space-y-2'>
                      <p className='font-semibold'>Upload failed</p>
                      <p className='text-xs'>{lectureDetails.uploadError}</p>
                      <button
                        type='button'
                        className='text-xs font-semibold underline'
                        onClick={() => setLectureDetails(prev => ({ ...prev, uploadStatus: 'idle', uploadError: '' }))}
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* YouTube URL UI */}
              {lectureDetails.videoProvider === 'youtube' && (
                <div className='space-y-3'>
                  <div className='space-y-1'>
                    <p className='font-semibold text-gray-700'>YouTube URL</p>
                    <input
                      type='text'
                      placeholder='https://youtube.com/watch?v=...'
                      className='w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none'
                      value={lectureDetails.videoUrl}
                      onChange={(e) => setLectureDetails({ ...lectureDetails, videoUrl: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1'>
                    <p className='font-semibold text-gray-700'>Duration (minutes)</p>
                    <input
                      type='number'
                      min='0'
                      placeholder='e.g. 12'
                      className='w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none'
                      value={lectureDetails.lectureDuration}
                      onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  className='flex-1 bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold hover:bg-blue-700'
                  onClick={handleAddLecture}
                  disabled={
                    lectureDetails.videoProvider === 'mux' && lectureDetails.uploadStatus !== 'done'
                  }
                >
                  Add
                </button>
                <button
                  type='button'
                  className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200'
                  onClick={() => { resetLectureDetails(); setShowPopup(false); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;