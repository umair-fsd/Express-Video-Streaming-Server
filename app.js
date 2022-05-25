const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const bp = require("body-parser");
const app = express();
const db = require("./config");
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
const testFolder = "./assets";

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./assets");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
var upload = multer({ storage: storage }).single("file");
function deleteFile(req, res) {
  const path = `./assets/${req.body.fileName}`;
  console.log("PATH = ", path);
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
    }
    console.log(req.body.fileName);
  });
  res.send(req.body.fileName);
}

app.get("/video", (req, res) => {
  res.sendFile("assets/video1.mp4", { root: __dirname });
});

//videos route
const Videos = require("./routes/Videos");
app.use("/videos", Videos);

app.get("/read", (req, res) => {
  fs.readdir(testFolder, (err, files) => {
    let list = [];
    files.forEach((file) => {
      list.push(file);
    });
    res.send(list);
  });
});
app.post("/uploadVideo", async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.log(err);
    } else {
      const docRef = db
        .collection("rssFeeds")
        .doc("feeds")
        .collection("videos")
        .doc();
      await docRef.set({
        language: req.body.lang,
        filename: req.file.filename,
      });

      res.status(200).send("Uploaded");
    }
  });
});
app.post("/deleteVideo", deleteFile);

app.listen(5005, () => {
  console.log("Listening on port 5005!");
});
