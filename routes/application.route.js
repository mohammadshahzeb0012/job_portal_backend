const express = require("express")
const { applyJob ,getAppliedJobs,getApplicants ,updateStatus} = require("./../controllers/application.controller")
const router = express.Router()
const isAuthenticated = require("./../middlewares/isAuthenticated")

router.get("/apply/:id",isAuthenticated,applyJob)
router.get("/get",isAuthenticated,getAppliedJobs)
router.get("/:id/applicants",isAuthenticated,getApplicants )
router.post("/status/:id/update",isAuthenticated,updateStatus )


module.exports = router