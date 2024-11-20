const express = require('express');
const router = express.Router();
const isAuthenticated = require("./../middlewares/isAuthenticated")
const { registerCompany, getCompanyById ,updateCompany,getCompany} = require("./../controllers/company.controller");
const singleUpload = require('../middlewares/multer');

router.post("/register", isAuthenticated, registerCompany)
router.route("/get").get(isAuthenticated,getCompany);
router.get('/get/:id',isAuthenticated,getCompanyById);
router.post("/update/:id",isAuthenticated,singleUpload, updateCompany);

module.exports = router 