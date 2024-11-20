const Application = require("./../models/application.model")
const Job = require("./../models/job.model")

const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const { id: jobId } = req.params;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };

        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }

        const newApplication = await Application.create({ job: jobId, applicant: userId })
        job.applications.push(newApplication._id)
        await job.save()

        return res.status(201).json({
            message: "Job applied successfully.",
            newApplication: newApplication,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const getAppliedJobs = async (req, res) => {
    const userId = req.id;
    try {
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } },
            }
        });

        if (!application) {
            return res.status(404).json({
                cmessage: "No Applications",
                success: false
            })
        }
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

const getApplicants = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        })

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            })
        }
        return res.status(200).json({
            job,
            succees: true
        });
    } catch (error) {
        console.log(error);
    }
}

const updateStatus = async (req, res) => {
    const { status } = req.body;
    const applicationId = req.params.id;

    try {
        if (!status ) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            })
        }

        // find the application by applicantion id
        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        }

        // update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });
    } catch (error) {
        consolole.log(error)
    }
}

module.exports = { applyJob, getAppliedJobs, getApplicants, updateStatus }