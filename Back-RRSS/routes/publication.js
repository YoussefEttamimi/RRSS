'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middleware/authenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({ uploadDir: './uploads/publications' })

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/uploadimagepub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadFile);
api.get('/getimagepub/:imageFile', PublicationController.getFile);

module.exports = api;