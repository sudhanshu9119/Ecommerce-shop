const userModel = require("../models/user");

module.exports.postCreateUser = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        
        const user = new userModel({
            name: name,
            email: email
        });

        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: user
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};