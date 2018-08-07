const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
	// cb = callback function
	// file - object, that contains the information about the file
	destination: (req, file, cb) => {
		// first parameter is error, in this case it is set to null;
		// second parameter is a destination folder, where images will be stored
		cb(null, 'public/images')

	},

	filename: (req, file, cb) => {
		// originalname property gives an original name of the file, that has been uploaded
		// and when the file is saved on the server side it is better to give to it the same name as it has on client side
		cb(null, file.originalname);
	}
});

const imageFileFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return cb(new Error('You can upload only image files!'), false);
	}
	// if the uploading file is an image and it matches the pattern, then I allow it to be uploaded
	cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('GET operation is not supported on /imageUpload');
})
.post(authenticate.verifyUser, upload.single('imageFile'), (req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.json(req.file);
})
.put(authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('PUT operation is not supported on /imageUpload');
})
.delete(authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('DELETE operation is not supported on /imageUpload');
})

module.exports = uploadRouter;