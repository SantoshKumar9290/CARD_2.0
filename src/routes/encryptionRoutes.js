const express = require('express');
const EncryptionHandler = require('../handlers/encryptionHandler');
const router = express.Router();
const handler = new EncryptionHandler();

router.get('/decryptValue/:id', [handler.decryptGivenValue]);
router.get('/encryptValue/:id', [handler.encryptGivenValue]);

router.get('/encryptPassword/:password', [handler.encryptPasswordValue]);

module.exports = router;