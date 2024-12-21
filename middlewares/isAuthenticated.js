const jwt = require("jsonwebtoken")

const isAuthenticated = async (req, res, next) => {
    console.log("auth middleware hited")

    try {
        const token = req?.cookies?.token || req?.headers["authorization"]?.split(" ")[1];

        // const token = req?.cookies?.token || req?.headers["authorization"]?.slice(8);
        console.log(token)
        if (!token) {
            return res.status(401).json({
                message: "Session expired please login again",
                success: false,
            })
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        console.log("decoded ",decode)
        if(!decode){
            console.log("not able to decode")
            return res.status(401).json({
                message:"Session expired please login again",
                success:false
            })
        };
        req.id = decode.userId;
        console.log("after all")
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
}

module.exports = isAuthenticated