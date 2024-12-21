const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
    console.log("auth middleware hit");

    try {
        const token = req?.cookies?.token || req?.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                success: false,
            });
        }

        const decoded = await jwt.verify(token, process.env.SECRET_KEY);

        if (!decoded) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                success: false,
            });
        }

        req.id = decoded.userId;
        console.log("Decoded user:", decoded);

        next();

    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            console.error("JWT malformed error:", err.message);
            return res.status(400).json({
                message: "Malformed token. Please provide a valid token.",
                success: false,
            });
        } else {
            console.error("Error in authentication middleware:", err);
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }
    }
};

module.exports = isAuthenticated;
