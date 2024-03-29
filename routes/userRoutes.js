const express = require("express");
const route = express.Router();
const sendResponse = require("../Helper/Helper");
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const AuthController = require("../Controller/authController");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Multer storage configuration (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary configuration
cloudinary.config({
  cloud_name: "dh0qyygrv",
  api_key: "733256674134826",
  api_secret: "Pk-JvJt0VmtKjucERG5Feah1wos",
});

route.post("/signup", async (req, res) => {
  const { userName, email, password } = req.body;
  const obj = { userName, email, password };
  let requiredArr = ["userName", "email", "password"];
  let errArr = [];

  requiredArr.forEach((x) => {
    if (!obj[x]) {
      errArr.push(x);
    }
  });

  if (errArr.length > 0) {
    res
      .send(sendResponse(false, null, "Some Fileds are Missing", errArr))
      .status(400);
    return;
  } else {
    let hashPassword = await bcrypt.hash(obj.password, 10);
    obj.password = hashPassword;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res
        .send(sendResponse(false, null, "This Email is Already Exist"))
        .status(403);
    } else {
      UserModel.create(obj)
        .then((result) => {
          res.send(sendResponse(true, result, "User Saved Successfully"));
        })
        .catch((err) => {
          res
            .send(sendResponse(false, err, "Internal Server Error"))
            .status(400);
        });
    }
  }
});
route.get("/test", AuthController.protected);
route.get("/", AuthController.getUsers);
route.post("/login", AuthController.login);
route.post("/");
route.post("/upload", upload.single("image"), AuthController.uploadImage);
route.post("/changePassword", AuthController.changePassword);
route.post("/deleteUser/:id", AuthController.deleteUser);
route.put("/:id", AuthController.editProfile);
// route.delete("/");

module.exports = route;
