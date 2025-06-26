const express = require('express');
const { fetchUserById, updateUser } = require('../controller/User');
const passport = require('passport');


const router = express.Router();
//  /users is already added in base path
router.get('/own',passport.authenticate('jwt'), fetchUserById)
      .patch('/:id', updateUser)

exports.router = router;