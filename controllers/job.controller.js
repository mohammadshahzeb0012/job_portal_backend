const mongoose = require("mongoose");
const Job = require("./../models/job.model")
const User = require("./../models/user.model")
const saveForLaterSchema = require("./../models/saveForLterModel")

const postJob = async (req, res) => {
    const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;
    const userId = req.id;

    if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !position || !companyId) {
        return res.status(400).json({
            message: "Somethin is missing.",
            success: false
        })
    };

    try {
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel,
            position,
            company: companyId,
            created_by: userId
        })
        // console.log(job)

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

const getHighlitJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate({
                path: "company"
            }).sort({ createdAt: -1 })
            .limit(10);

        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        }

        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

const getAllJobs = async (req, res) => {
    const keyword = req.query.keyword || "";
    const userId = req.id

    try {
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        const jobs = await Job.find(query)
            .populate({
                path: "company"
            }).sort({ createdAt: -1 })

        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        }

        const savedJobs = await saveForLaterSchema.find({
            userID: userId,
        }).select('jobId');

        const savedJobIds = savedJobs.map((save) => save.jobId.toString())
        const newArr = jobs?.map(job => job.toObject())

        newArr?.forEach((job) => {
            if (savedJobIds.includes(job._id.toString())) {
                job.saveForLater = true
            } else {
                job.saveForLater = false
            }
        })

        return res.status(200).json({
            jobs: newArr,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

const getAdminJobs = async (req, res) => {
    const adminId = req.id;
    try {
        const jobs = await Job.find({
            created_by: adminId
        }).populate({
            path: 'company',
            createdAt: -1
        })
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        }

        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const getSavedJobs = async (req, res) => {
    const userId = req.id
    console.log(userId)
    res.send("gfds")
}

const saveForLater = async (req, res) => {
    const { jobId } = req.body
    const userId = req.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
            message: "jobId is required!",
            success: false
        })
    }

    try {
        let user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        const jobExists = await Job.findById(jobId)
        if (!jobExists) {
            return res.status(400).json({
                message: "job not found.",
                success: false
            })
        }

        const saveLaterExists = await saveForLaterSchema.findOne({
            userID: userId,
            jobId: jobId
        })
        if (saveLaterExists) {
            await saveForLaterSchema.findOneAndDelete({
                userID: userId,
                jobId: jobId
            })
            return res.status(200).json({
                message: " job unsaved successfully.",
                success: true
            });
        }

        const newSaveLAter = new saveForLaterSchema({
            userID: userId,
            jobId: jobId
        })

        await newSaveLAter.save()
        return res.status(201).json({
            message: " job saved successfully.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "server error.",
            success: false
        });
    }
}

const getJobById = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findById(jobId).populate("applications")
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        }
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}

module.exports = { postJob, saveForLater, getJobById, getSavedJobs, getAdminJobs, getAllJobs, getHighlitJobs }