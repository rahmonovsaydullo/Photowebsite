const express = require("express");
const {
  getPhotos,
  addPhoto,
  deletePhoto,
  myPhotos,
  upload,
} = require("../controllers/photoController");
const { authentication } = require("../middleware/authentication");
const photoRouter = express.Router();

photoRouter.post("/", authentication, upload.single("photo"), addPhoto);
photoRouter.get("/",  getPhotos); // authentication,
photoRouter.get("/:userId", authentication, myPhotos);
photoRouter.delete("/:id", authentication, deletePhoto);
module.exports = photoRouter;
