require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')
const bodyParser = require("body-parser");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const courseRouter =  require("./routes/course");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@my-course.xkflq08.mongodb.net/?retryWrites=true&w=majority`,
      {
        // useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
connectDB();



const app = express();
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json({limit: '50mb'}));
app.use("/api/auth", authRouter);
app.use('/api/posts', postRouter);
app.use("/api/courses", courseRouter);

const PORT = 5000;
//const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
