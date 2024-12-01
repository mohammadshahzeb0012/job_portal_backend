const User = require("./../models/user.model")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDataUri = require("../utils/datauri");
const cloudinary = require('./../utils/cloudinary');
const getMediaName = require("../utils/imageName");
const sendEmail = require("../utils/SendEmail");
const cloudinaryv2 = require('cloudinary').v2;
const uaParser = require('ua-parser-js');


const register = async (req, res) => {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        });
    };

    try {
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const NewUser = new User({
            fullname,
            email,
            phoneNumber: Number(phoneNumber),
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: ""
            }
        })
        await NewUser.save()

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "error",
            success: error
        });
    }

}

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };

        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false,
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        }

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' })

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const sendForgotLink = async (req, res) => {
    const { email, role } = req.body

    if (!email || !role) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        });
    }

    try {

        const userAgent = req.headers['user-agent'];
        const parser = new uaParser();
        const result = parser.setUA(userAgent).getResult();

        const operatingSystem = result.os.name;
        const browserName = result.browser.name;

        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false,
            })
        }

        if (user.role !== role) {
            return res.status(400).json({
                message: "User not found with current role.",
                success: false,
            })
        }

        const payLoad = {
            email: user.email,
            userId: user._id
        }

        const sendData = await jwt.sign(payLoad, process.env.SECRET_KEY, { expiresIn: "10m" })
        const subject = "Password Reset"
        const name = user.fullname
        await sendEmail({ email, subject, name, role, operatingSystem, browserName, sendData })

        return res.status(200).json({
            message: "Link sent on registerd mail",
            success: true
        })

    } catch (error) {

    }
}

const changePassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        });
    };

    try {
        const verifiedUser = await jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findById(verifiedUser.userId)

        if (!user) {
            return res.status(400).json({
                message: "user not found",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

       await User.findOneAndUpdate(
            { _id: verifiedUser.userId },
            { password: hashedPassword }
        )

        return res.status(200).json({
            message: "Password changed",
            success: true
        })
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "token expired",
                success: false
            })
        }

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            })
        }
    }
}

const ProfileDetails = async (req, res) => {
    const userId = req.id;
    try {
        let user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        return res.status(200).json({
            user: user,
            success: true
        })
    } catch (error) {

    }

}

const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const userId = req.id; // middleware authentication
        let user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        const file = req.file
        let cloudResponse = null;


        if (file) {
            const fileUri = getDataUri(file)
            cloudResponse = await cloudinary.uploader.upload(fileUri.content)
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (phoneNumber) user.phoneNumber = phoneNumber
        if (bio) user.profile.bio = bio
        if (skills) user.profile.skills = skillsArray

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url
            user.profile.resumeOriginalName = file.originalname
        }

        await user.save()
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

const updateProfilePic = async (req, res) => {
    try {
        const { fileIri } = req.body
        const file = req.file
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        let imageNAme = null
        if (fileIri !== null || fileIri !== '') {
            imageNAme = getMediaName(fileIri)
        }

        let cloudResponse = null
        if (imageNAme !== null) {
            cloudResponse = await cloudinaryv2.uploader.destroy(imageNAme)
        }

        if (file !== undefined && file !== null) {
            const fileUri = getDataUri(file)
            cloudResponse = await cloudinary.uploader.upload(fileUri.content)
            user.profile.profilePhoto = cloudResponse.secure_url
        }

        await user.save()
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile pic successfully.",
            user,
            success: true
        })

    } catch (error) {

    }
}

module.exports = {
    register, login, logout,
    sendForgotLink, changePassword,
    updateProfile, updateProfilePic,
    ProfileDetails
} 