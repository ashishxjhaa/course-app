const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

adminRouter.post('/signup', async function(req, res) {
    const { email, password, firstName, lastName } = req.body;

    await adminModel.create({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName
    })

    res.json({
        message: "signup endpoint"
    })
})

adminRouter.post('/signin', async function(req, res) {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({
        email: email,
        password: password
    })

    if (admin) {
        const token = jwt.sign({
            id: admin._id
        }, JWT_ADMIN_PASSWORD);

        res.json({
            token: token
        })
        return;
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    res.json({
        message: "signup endpoint"
    })
    return;
})

adminRouter.post('/course', adminMiddleware, async function(req, res) {
    try {
        const adminId = req.userId;

        const { title, description, imageUrl, price } = req.body;

        const course = await courseModel.create({
            title: title,
            description: description, 
            imageUrl: imageUrl,
            price: price,
            creatorId: adminId
        })

        res.json({
            message: "Course created",
            courseId: course._id
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating course",
            error: error.message
        })
    }
})

adminRouter.put('/course', adminMiddleware, async function(req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    },{
        title, description, imageUrl, price
    })

    res.json({
        message: "Course updated",
        courseId: course._id
    })
})

adminRouter.get('/course/bulk', adminMiddleware, async function(req, res) {
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId
    });

    res.json({
        message: "Course updated",
        courses
    })
})

module.exports = {
    adminRouter: adminRouter
}