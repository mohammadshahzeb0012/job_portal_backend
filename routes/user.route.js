const express = require('express');
const router = express.Router();
const { register, login, logout, updateProfile, updateProfilePic } = require("./../controllers/user.controller");
const isAuthenticated = require("./../middlewares/isAuthenticated");
const singleUpload= require("./../middlewares/multer")

router.post("/register",singleUpload, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/updateProfile",isAuthenticated,singleUpload,  updateProfile);
router.post("/updateProfilepic",isAuthenticated,singleUpload,updateProfilePic)

module.exports = router;
