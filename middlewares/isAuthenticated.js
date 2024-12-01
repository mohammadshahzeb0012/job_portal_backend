const jwt = require("jsonwebtoken")

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req?.cookies?.token || req?.headers["authorization"]?.slice(8);
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY)
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            })
        };
        req.id = decode.userId;
        next();
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

module.exports = isAuthenticated