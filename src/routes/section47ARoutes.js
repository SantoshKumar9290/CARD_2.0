const express = require('express')
const MISHandler = require('../handlers/section47AHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');

const handler = new MISHandler();
const router = express.Router();

router.post('/generateForm1PDF', validateSchema(sqlQuerySchemaValidation),[handler.generateForm1PDF47A]);
router.post('/generateForm2PDF', validateSchema(sqlQuerySchemaValidation),[handler.generateForm2PDF47A]);
router.get('/:type/getSRDoctDetails', validateSchema(sqlQuerySchemaValidation),[handler.getSRDoctDetails]);
router.post('/:type/:form/getSection47APDF', validateSchema(sqlQuerySchemaValidation),[handler.getSection47APDF]);
router.get('/getSec47aStatus', validateSchema(sqlQuerySchemaValidation),[handler.getSec47aStatus]);
router.put('/drAccept', validateSchema(sqlQuerySchemaValidation),[handler.drAccept]);
router.put('/srAccept', validateSchema(sqlQuerySchemaValidation),[handler.srAccept]);
router.get('/VerifySec47a', validateSchema(sqlQuerySchemaValidation),[handler.VerifySec47a]);

module.exports = router;