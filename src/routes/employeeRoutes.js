const express = require('express')
const employeeHandlder = require('../handlers/employeeHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');
 
 
const handler = new employeeHandlder();
const router = express.Router();
 
router.get('/getEmployees',[handler.getEmployees]);
router.post('/login',[handler.login]);
router.post('/token', [handler.generateToken]);
router.get('/getEmployeesSR',[handler.getEmployeesSR]);
router.get('/getDRList',[handler.getDRList]);
router.get('/getEmployeesDR',[handler.getEmployeesDR]);
router.get('/getEmployeesCIG',[handler.getEmployeesCIG]);
router.get('/getVSWSList',[handler.getVSWSList])
router.get('/getVSWSMList',[handler.getVSWSMList]);
router.post('/empTrans',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.empTransaction]);
router.post('/empcreation',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.empCreation]);
router.put('/updCreation',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updCreation]);
router.get('/getEmpUser',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEmpUser]);
router.get('/getEmpRoles',validateSchema(sqlQuerySchemaValidation),[handler.getEmpRoles]);
router.post('/saveVSWS',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.saveVSWSAssign]);
router.put('/updateVSWS',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.vswsSroAssignNo]);
router.post('/saveUser',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.empUserSave]);
router.get('/getAssign',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getVSWSAssign]);
router.get('/getSRMaster',[handler.getSRMaster]);
router.post('/saveSR',[handler.saveAssignSR]);
router.get('/availableSros',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getAvailableSros]);
router.get('/assignedSro',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getAssignedSros]);
router.post('/loginPwd', [handler.loginWithPassword]);
router.post("/updatePassword", verifyjwt, [handler.updatePassword]);
router.put("/updateSRO", [handler.updateSRO]);
router.post('/deptLogin',[handler.deptLogin]);
router.get('/getDept',[handler.getDeptLogin]);
router.get('/GetNodal',[handler.getEmployeesNODAL]);
router.delete('/deleteAT',[handler.deleteAT])
router.get('/sroList',[handler.getEmployeesAll]);
//frankin routes DDO
router.get('/getSro',[handler.getSrosDR]);

 
module.exports = router;