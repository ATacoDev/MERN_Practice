const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// get, post, patch, delete for /users endpoint

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean() // exclude the password during the get request
    if(!users?.length) {
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})

const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    // Confrim data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username'})
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPwd, roles }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { // created
        res.status(201).json({ message: `New user ${username} created`})
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found'})
    }

    //Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()
    // Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) { // duplicates
        return res.status(409).json({ message: 'Duplicate username'})
    } // otherwise it's not a duplicate, and rather just the user that we're looking for

    user.username = username
    user.roles = roles
    user.active = active
    if (password) {
        // Hash password
        user.password = await bcrypt.hash(password, 10) // salt rounds
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated`})
})

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    const note = await Note.findOne({ user: id }).lean().exec();
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Store the username and ID before deletion
    const username = user.username;
    const userId = user._id;

    await user.deleteOne(); // Now this just deletes the user

    const reply = `Username ${username} with ID ${userId} deleted`;

    res.json(reply);
});


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}