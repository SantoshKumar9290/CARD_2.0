const express = require("express");
 
const sqlQuerySchemaValidation = require("../schemas/apiValidationSchemas/sqlQueryValidationSchema");
 
 
 
const { validateSchema } = require("../plugins/ajv");
 
const refusehandler = require("../handlers/refuseHandler");
const { verifyjwt } = require("../plugins/auth/authService");
 
 
 
const router = express.Router();
 
const handler = new refusehandler();
 
 
 
router.get("/refuseDoc", validateSchema(sqlQuerySchemaValidation), [handler.refuseDoc,]);
router.get("/generateDocument",  [handler.generateDocument ]);
router.get("/getcoordinatesdata",  [handler.getcoordinatesdata ]);
router.get("/refuseDocrepresent", validateSchema(sqlQuerySchemaValidation), [handler.refuseDocrepresent]);
router.get("/pendingEsignList",[handler.pendingesignlist]);
router.get('/pdfpreview',[handler.pdfpreview]);
router.get("/getrdoctnoPendingNo",[handler.getrdoctnoPendingNo]);
router.get ('/getRdocstatus',[handler.getRdocstatus]);
router.get('/verifyDocExistance', [handler.verifyApplicationExistance])

 
module.exports = router;