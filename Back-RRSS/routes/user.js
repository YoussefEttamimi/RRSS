'use strict'

const express = require('express')
const UseController = require('../controllers/user')

const api = express.Router();
const md_auth = require('../middleware/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/users' });

api.post('/register', UseController.saveUser);
api.post('/login', UseController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UseController.getUser);
api.get('/users/:page?', md_auth.ensureAuth, UseController.getUsers);
api.put('/user/update/:id', md_auth.ensureAuth, UseController.updateUser);
api.post('/user/upload_image/:id', [md_auth.ensureAuth, md_upload], UseController.uploadImage);
api.get('/user/get_image/:imageFile', UseController.getImageFile);
api.get('/usercounters/:id?', md_auth.ensureAuth, UseController.getCounters);

module.exports = api;