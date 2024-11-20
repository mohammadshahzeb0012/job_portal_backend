const express = require("express")
const app = express()
const PORT = process.env.PORT || 8000;
const connectDB = require("./utils/db")
const cookieParser = require('cookie-parser');
const cors = require("cors")
require('dotenv').config();
//file imports
const isAuthenticated = require("./middlewares/isAuthenticated")
const userRoute = require("./routes/user.route")
const companyRoute = require("./routes/company.route")
const jobRoute = require("./routes/job.route")
const applicationRoute = require("./routes/application.route");
const userModel = require("./models/user.model");


// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company",companyRoute)
app.use("/api/v1/job",jobRoute)
app.use("/api/v1/application",applicationRoute)

app.listen(PORT,()=>{
    connectDB()
    console.log(`Server running at port ${PORT}`);
})