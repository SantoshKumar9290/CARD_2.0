const express = require('express')
const ProhibitedPropertyHandler = require('../handlers/prohibitedPropertyHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');



const handler = new ProhibitedPropertyHandler();
const router = express.Router();

router.get('/getListVillagesR',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getListVillagesR]);
router.get('/getListVillagesU',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getListVillagesU]);
router.get('/getListofRoles',verifyjwt,[handler.getListofRoles])
router.get('/getPPCodes',verifyjwt,[handler.getPPCodes]);
router.get('/getPPSections',verifyjwt,[handler.getPPSections]);
router.get('/:type/getDenotify',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getDenotifyVillage]);
router.post('/:type/save',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.saveVillageHandler]);
router.post('/:type/denotify',verifyjwt,[handler.saveDenotifyVillage]);


router.get('/getListVillagesMakeEffectiveReqR',verifyjwt,[handler.getListVillagesMakeEffectiveReqR]);
router.get('/getListVillagesMakeEffectiveReqU',verifyjwt,[handler.getListVillagesMakeEffectiveReqU]);
router.get('/getListVillagesRDRACR',verifyjwt,[handler.getListVillagesRDRAC]);
// router.get('/getListVillagesUDRACU',verifyjwt,[handler.getListVillagesUDRAC]);
router.get('/:type/notifyDetails',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getNotifyDetails]);
router.put('/:type/update',[handler.updateVillageHandler]);
router.get('/:type/getExtentnotifyDetails',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getExtentNotifyDetails]);
router.put('/:type/updateExtent',[handler.updateExtentVillageHandler]);

router.post('/PPDenotifypendingesignlist',verifyjwt, [handler.PPDenotifypendingEsignList]);
router.post('/PPpendingesignlist',verifyjwt, [handler.PPpendingEsignList]);




module.exports = router;