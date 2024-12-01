const getDataUri = require("../utils/datauri");
const Company = require("./../models/company.model")
const cloudinaryv2 = require('cloudinary').v2;
const cloudinary = require('./../utils/cloudinary');
const getMediaName = require("../utils/imageName");


const registerCompany = async (req, res) => {

    try {
        const { companyName } = req.body
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }

        let company = await Company.findOne({ name: companyName })
        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        }

        company = await Company.create({ name: companyName, userId: req.id })
        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId })
        console.log(companies.length)
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }

        return res.status(200).json({
            companies,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

const getCompanyById = async (req, res) => {
    const companyId = req.params.id;
    try {
        const company = await Company.findById(companyId)
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }

        return res.status(200).json({
            company: company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const updateData = {}
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (website) updateData.website = website;
        if (location) updateData.location = location;

        const isAvailible = await Company.findById(req.params.id)
        if (!isAvailible) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }

        const file = req.file
        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file)
            cloudResponse = await cloudinary.uploader.upload(fileUri.content)
        }

        if (cloudResponse !== null) {
            updateData.logo = cloudResponse.secure_url
        }
         await Company.findByIdAndUpdate(req.params.id, updateData, { new: true })

        return res.status(200).json({
            message: "Company information updated.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = { registerCompany, getCompanyById, getCompany, updateCompany }