const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Trip = require('../models/trip');

// New user made
router.post('/', async (req, res) => {
		const hashedUserPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
		const userPassEntry = {};
		userPassEntry.password = hashedUserPassword;
		userPassEntry.username = req.body.username;
		userPassEntry.email = req.body.email;
		userPassEntry.trips = [];
	try {
		const foundUser = await User.findOne({ username: req.body.username });
// The unique function on my model was not working. This checks to see if the name is already there.
		if (foundUser) {
			res.json({
				status: 409,
				data: 'Try another username.'
			});
		} else {
			const newUser = await User.create(userPassEntry);
			req.session.loggedIn = true;
			req.session._id = newUser._id;
			req.session.username = newUser.username;
			res.json({
				status: 201,
				data: {
					message: 'user creation successful',
					user: newUser
				}
			})
		}
	} catch(err) {
		console.log(err);
		
	}
})

// Login
router.post('/login', async (req, res) => {
	try {
		const returnUser = await User.findOne({ username: req.body.username });
		if (bcrypt.compareSync(req.body.password, returnUser.password)) {
			req.session._id = returnUser._id;
			req.session.username = returnUser.username;
			req.session.loggedIn = true;
			res.json({
				status: 200,
				data: {
					message: 'login successful',
					user: returnUser
				}
			})
			// If you have the wrong password
		} else {
			res.json({
				status: 401,
				data: 'Failed to login. Try another username or password.'
			})
		}
		// If you have the wrong username
	} catch(err) {
		console.log(err);
		res.json({
			status: 401,
			data: 'Failed to login. Try another username or password.'
		})
	}
});

// Logout
router.get('/logout', async (req, res) => {
	req.session.destroy((err) => {
		res.json({
			status: 200,
			data: 'logged out'
		})
	})
});


module.exports = router;