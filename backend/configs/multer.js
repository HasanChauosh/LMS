import multer from 'multer';
import path from 'path';

//Multer helps your server receive and store files (images, videos, PDFs, etc.) sent from a form or frontend.
//Parses multipart/form-data

const storage=multer.diskStorage({})

const upload= multer({storage})

export default upload