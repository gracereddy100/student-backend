const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"])
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(cors({
    origin: ["*", "http://localhost:5173", "https://student-frontend-rho-silk.vercel.app"],
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-type","Authorization"],
    credentials: true
}));

const connectToDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://gracereddy100_db_user:a7ZfDEhcxTqsEeZe@cluster0.jql7ea5.mongodb.net/studentclub?appName=Cluster0");
        console.log("Database connected...");
    } catch (error) {
        console.log("Not connected...", error);
    }
};
connectToDB();

const studentSchema = mongoose.Schema({
    name: String,
    email: String,
    clubName: String,
    isVerified: Boolean
});
const StudentsModel = mongoose.model("Students", studentSchema);

app.get("/", (req, res) => {
    res.send("server is running..");
});

app.post("/create/student/", async (req, res) => {
    const newStudent = StudentsModel({
        name: req.body.name,
        email: req.body.email,
        clubName: req.body.clubName,
        isVerified: false
    });
    await newStudent.save();
    res.send(newStudent);
});

app.get("/all/students", async (req, res) => {
    const allStudents = await StudentsModel.find();
    res.send(allStudents);
});

app.get("/get/student/bymail", async (req, res) => {
    try {
        const findStudent = await StudentsModel.findOne({ email: req.body.email });
        if (!findStudent) {
            return res.status(404).send("Student not found.");
        }
        res.send(findStudent);
    } catch {
        res.send("error");
    }
});

app.put("/update/student/", async (req, res) => {
    try {
        const updateStudents = await StudentsModel.updateOne(
            { email: req.body.email },
            { name: req.body.name, clubName: req.body.clubName }
        );

        if (updateStudents.matchedCount === 0) {
            return res.status(404).send("Student not found");
        }

        res.send(updateStudents);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch("/update/isVerified", async (req, res) => {
    const updateIsVerified = await StudentsModel.updateOne(
        { email: req.body.email },
        { isVerified: req.body.isVerified }
    );
    if (updateIsVerified.matchedCount === 0) {
        return res.status(404).send("Student not found.");
    }
    res.send("updated.");
});

app.delete("/delete/student", async (req, res) => {
    const deleteStudent = await StudentsModel.deleteOne({ email: req.body.email });
    if (deleteStudent.deletedCount === 0) {
        return res.status(404).send("Student not found");
    }
    res.send(deleteStudent);
});

app.listen(8000, () => {
    console.log("server is running on port 8000");
});