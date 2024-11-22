const express = require("express")
const isAuthenticated = require("./../middlewares/isAuthenticated")
const { postJob, getJobById,saveForLater,getHighlitJobs
     ,getAdminJobs,getAllJobs, getSavedJobs} = require("./../controllers/job.controller")
const router = express.Router()

router.post("/post", isAuthenticated, postJob)
router.get("/get",isAuthenticated, getAllJobs)
router.get("/hightJobs",isAuthenticated ,getHighlitJobs)
router.get("/getSavedJobs",isAuthenticated,getSavedJobs)
router.post("/saveForLater",isAuthenticated,saveForLater)
router.get("/getadminjobs",isAuthenticated,getAdminJobs)
router.get("/get/:id",getJobById)

module.exports = router