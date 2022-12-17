const express = require('express')
const router = express.Router()
const multer = require("multer");
const fs = require("fs");
const verifyToken = require('../middleware/auth')

const Post = require('../models/Post')

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	  cb(null, 'uploads');
	},
	filename: (req, file, cb) => {
	  cb(null, file.originalname);
	},
  }); 

  const upload = multer({ storage: storage });

// @route GET api/posts
// @desc Get posts
// @access Private
router.get('/', verifyToken, async (req, res) => {
	try {
		const posts = await Post.find({  }).populate('postedBy', [
			'username'
		])
		res.json({ success: true, posts })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// @route POST api/posts
// @desc Create post
// @access Private
router.post('/', verifyToken, upload.single("image"),async (req, res) => {
	const { title, content, like } = req.body

	// Simple validation
	if (!title)
		return res
			.status(400)
			.json({ success: false, message: 'Title is required' })

	try {
		const newPost = new Post({
			title,
			content,
			image: {
				data: fs.readFileSync("uploads/" + req.file.filename),
				contentType: "image/png",
			  },
			like,
			postedBy: req.userId
		})

		await newPost.save()

		res.json({ success: true, message: 'Post success !', post: newPost })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// @route PUT api/posts
// @desc Update post
// @access Private
router.put('/:id', verifyToken, upload.single("image"), async (req, res) => {
	const { title, content, like } = req.body

	// Simple validation
	if (!title)
		return res
			.status(400)
			.json({ success: false, message: 'Title is required' })

	try {
		let updatedPost = {
			title,
			content: content || '',
			image: {
				data: fs.readFileSync("uploads/" + req.file.filename),
				contentType: "image/png",
			  } || {},
			like
		}

		const postUpdateCondition = { _id: req.params.id, postedBy: req.userId }

		updatedPost = await Post.findOneAndUpdate(
			postUpdateCondition,
			updatedPost,
			{ new: true }
		)

		// User not authorised to update post or post not found
		if (!updatedPost)
			return res.status(401).json({
				success: false,
				message: 'Post not found or user not authorised'
			})

		res.json({
			success: true,
			message: 'Success!',
			post: updatedPost
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// @route DELETE api/posts
// @desc Delete post
// @access Private
router.delete('/:id', verifyToken, async (req, res) => {
	try {
		const postDeleteCondition = { _id: req.params.id, postedBy: req.userId }
		const deletedPost = await Post.findOneAndDelete(postDeleteCondition)

		// User not authorised or post not found
		if (!deletedPost)
			return res.status(401).json({
				success: false,
				message: 'Post not found or user not authorised'
			})

		res.json({ success: true, post: deletedPost })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// @route PATCH api/posts
// @desc Update post like
// @access Private
router.patch('/updatelike/:id', verifyToken, async (req, res) => {
	const { like } = req.body
    
	// Simple validation
	try {
		let updatedPost = {
			
			like
		}

		const postUpdateCondition = { _id: req.params.id }

		updatedPost = await Post.findOneAndUpdate(
			postUpdateCondition,
			updatedPost,
			{ new: true }
		)

		// User not authorised to update post or post not found
		if (!updatedPost)
			return res.status(401).json({
				success: false,
				message: 'Post not found or user not authorised'
			})

		res.json({
			success: true,
			message: 'Success!',
			post: updatedPost
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})


module.exports = router