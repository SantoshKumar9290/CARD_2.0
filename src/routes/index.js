const express = require('express');
const router = express.Router();
const employees = require('./employeeRoutes');
const preRegistration = require('./preRegistrationRoutes');
const sroList = require('./sroListRoutes')
const pendingEsign  = require('./esignPendingRoutes')
// const pendingPde = require('./pdePendingRoutes')
const cashPayable  = require('./cashRecieptRoutes');
const reports = require('./reportsRoutes');
// const AuthHandler = require('../handlers/authHandler');
// const authHandler = new AuthHandler();
const stock = require('./stockHoldingRoutes')
const ekyc = require('./eKycRoutes')
const assign = require('./assignRoutes')
const endorse = require('./endorseAndBundling');
const docHandover  = require('./docHandoverRoutes');
const eSign = require('./esignRoutes');
const prohibitedProperty = require('./prohibitedPropertyRoutes');
const checkSlipReport = require('./checkSlipReportRoutes');
const autoMutation  = require('./autoMutationRoutes');
const scanning = require('./scanningRoutes');
const mvRevision = require('./mvRevisionRoutes');
const drJob = require('./drJobRoutes')
const cardMaster = require('./cardMasterRoutes')
const dsc = require('./dscRoutes')
const cc = require('./ccRoutes')
const tdAllocations = require('./tdAllocationsRoutes')
const form = require('./formRoutes')
const misHandle = require('./misRoutes')
const updateDocument = require('./updateDocumentRoutes')
const account = require('./accountRoutes')
const refuseDoc = require('./refuseRoutes')
const audit=require('./auditRoutes')
const nameSeach = require('./nameSearchRouters')
const stamp = require('./stampsRoutes')
const ti = require('./thumbImpressionRoutes');
const Section47A = require('./section47ARoutes');
const slotsRouter = require('./slotsRoutes')
const urbanRoutes = require('./urbanRoutes') 
const encryptionRoutes = require('./encryptionRoutes') 
const cronjobs= require('./cronjobsRoutes');


router.get('/healthCheck',(req,res)=>{
    res.send("OK");
})
router.use('/emp',employees);
router.use('/preRegistraion',preRegistration);
router.use('/srolist',sroList);
router.use('/pendingesign',pendingEsign)
router.use('/esign',eSign);
router.use('/cash',cashPayable);
router.use('/report',reports);
 router.use('/mvRevision',mvRevision);

router.use('/stock',stock);
router.use('/eKyc',ekyc);
router.use('/assign',assign);
router.use('/endorse',endorse);
router.use('/docHandover',docHandover);
router.use('/prohibitedProperty',prohibitedProperty);
router.use('/checkSlip',checkSlipReport)
router.use('/autoMutation',autoMutation)
router.use('/scanning',scanning);
router.use('/drJob',drJob);
router.use('/cardMaster',cardMaster)
router.use('/dsc',dsc)
router.use('/cc',cc)
router.use('/tdAllocations',tdAllocations)
router.use('/form',form);
router.use('/misHandle',misHandle)
router.use('/updatedocument', updateDocument)
router.use('/accounts',account)
router.use('/refuseDoc',refuseDoc)
router.use('/audit', audit)
router.use('/nameSeach',nameSeach)
router.use('/ti',ti);
router.use('/stamp',stamp);
router.use('/section47A', Section47A);
router.use('/slots', slotsRouter);
router.use('/urban', urbanRoutes);
router.use('/encryption', encryptionRoutes);
router.use('/cronjobs', cronjobs);


module.exports = router;