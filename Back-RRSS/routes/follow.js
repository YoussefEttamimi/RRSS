'use strict'

const express = require('express');
const FollowController = require('../controllers/follow');
const api = express.Router();
const md_auth = require('../middleware/authenticated');

api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
api.get('/getmyfollows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);


module.exports = api;