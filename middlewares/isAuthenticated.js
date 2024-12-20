const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req?.cookies?.token || req?.headers["authorization"]?.split(" ")[1]
        if (!token) {
            return res.status(401).json({
                message: "Session expired, please log in again",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (!decoded) {
            return res.status(401).json({
                message: "Session expired, please log in again",
                success: false,
            });
        }

        req.userId = decoded.userId;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Session expired, please log in again",
                success: false,
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({
                message: "Invalid token, please log in again",
                success: false,
            });
        }
        
        return res.status(500).json({
            message: "An unexpected error occurred, please try again later",
            success: false,
        });
    }
};

module.exports = isAuthenticated;