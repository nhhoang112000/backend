const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const verifyToken = require("../middleware/auth");

const Course = require("../models/Course");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// @route GET api/courses
// @desc Get courses
// @access Private
router.get("/", verifyToken, async (req, res) => {
  try {
    const courses = await Course.find({}).populate("postedBy", ["username"]);
    res.json({ success: true, courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route COURSE api/courses
// @desc Create course
// @access Private
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const { title, description, url, cost, type, framework, rate, learner } =
    req.body;

  // Simple validation
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });

  try {
    const newCourse = new Course({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      cost,
      type,
      framework,
      rate,
      learner,
      image: {
        data: fs.readFileSync("uploads/" + req.file.filename),
        contentType: "image/png",
      },
      postedBy: req.userId,
    });

    await newCourse.save();

    res.json({
      success: true,
      message: "Post course success !",
      course: newCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route PUT api/courses
// @desc Update course
// @access Private
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const {
    title,
    description,
    url,
    cost,
    type,
    framework,
    rate,
    learner,
    image,
  } = req.body;

  // Simple validation
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });

  try {
    let updatedCourse = {
      title,
      description,
      url: (url.startsWith("https://") ? url : `https://${url}`) || "",
      cost,
      type,
      framework,
      rate,
      learner,
      image:
        {
          data: fs.readFileSync("uploads/" + req.file.filename),
          contentType: "image/png",
        } || {},
      //   postedBy: req.userId
    };

    const courseUpdateCondition = { _id: req.params.id, postedBy: req.userId };

    updatedCourse = await Course.findOneAndUpdate(
      courseUpdateCondition,
      updatedCourse,
      { new: true }
    );

    // User not authorised to update post or post not found
    if (!updatedCourse)
      return res.status(401).json({
        success: false,
        message: "Course not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Success!",
      course: updatedCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route DELETE api/courses
// @desc Delete course
// @access Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const courseDeleteCondition = { _id: req.params.id, postedBy: req.userId };
    const deletedCourse = await Course.findOneAndDelete(courseDeleteCondition);

    // User not authorised or course not found
    if (!deletedCourse)
      return res.status(401).json({
        success: false,
        message: "Course not found or user not authorised",
      });

    res.json({ success: true, course: deletedCourse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route PATCH api/courses
// @desc Update course rating
// @access Private
router.patch("/update-rate/:id", verifyToken, async (req, res) => {
  const { rate } = req.body;
  const course = await Course.findById(req.params.id);
  const learner = course.learner;

  //if user rated this course they can rate again
  if (learner.includes(req.userId)) {
    return res.status(401).json({
      success: false,
      message: "Cannot rating",
    });
  } else {
    learner.push(req.userId);
    try {
      let updatedCourse = {
        rate,
        learner,
      };
      console.log(updatedCourse);

      const courseUpdateCondition = { _id: req.params.id };

      updatedCourse = await Course.findOneAndUpdate(
        courseUpdateCondition,
        updatedCourse,
        { new: true }
      );

      // User not authorised to update post or post not found
      if (!updatedCourse)
        return res.status(401).json({
          success: false,
          message: "Course not found or user not authorised",
        });

      res.json({
        success: true,
        message: "Success!",
        course: updatedCourse,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
});

module.exports = router;
