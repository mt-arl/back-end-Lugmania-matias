// userRoutes.js
const express = require('express');
const router = express.Router();
const userController2 = require('../controllers/userController2');

// Get all users
router.get('/', userController2.getAllUsers);

// Get user by ID
router.get('/:id', userController2.getUserById);

// Create new user
router.post('/', userController2.createUser);

// Update user
router.put('/:id', userController2.updateUser);

// Delete user
router.delete('/:id', userController2.deleteUser);

// Update password
router.patch('/:id/password', userController2.updatePassword);
//

module.exports = router;