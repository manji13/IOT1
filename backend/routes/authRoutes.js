const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getUsers, 
    updateUser, 
    deleteUser 
} = require('../controllers/authController');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// User Management routes (Added here)
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;