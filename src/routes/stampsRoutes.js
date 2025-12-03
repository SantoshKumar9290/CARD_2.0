const express = require('express')
const stampsHandler = require('../handlers/stampsHandler');
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new stampsHandler();
const router = express.Router();

router.get('/stampNames',verifyjwt,[handler.getStampNames]);         //to get serial stamp details//
router.get('/getStampForIndent',verifyjwt,[handler.getStampForIndent]);         //to get serial stamp details//

router.get('/stampNamesn',verifyjwt,[handler.getStampNamesn]);         //to get non serial stamp details//
router.get('/stampCatTypeDeno',verifyjwt,[handler.getstampCatTypeDeno]);     //to get category , type and denomination based on stampname selection//
router.get('/getstampDeno',verifyjwt,[handler.getstampDeno]);     //to get  denomination based on stampname selection//

router.post('/nodalEntryRegisterEntrywithS',verifyjwt,[handler.NodalEntryRegisterEntryWithS]); // serial stamps entry in Nodal officer login //
router.post('/nodalEntryRegisterEntrywithoutS',verifyjwt,[handler.NodalEntryRegisterEntryWithoutS]); //non serial  stamps entry in Nodal officer login//

router.post('/nodalDistriwithS',verifyjwt,[handler.NodalDistriwithS]);  //Nodal officer serial stamps Distruibution to dr's//
router.post('/nodalDistriwithoutS',verifyjwt,[handler.NodalDistriwithoutS]); //Nodal officer Non serial stamps Distruibution to dr's//

router.get('/getnodalEntryRegisterS',verifyjwt,[handler.GetnodalEntryRegisterS]); //Get serial stamps Entry Details//
router.get('/getnodalEntryRegisterwithoutS',verifyjwt,[handler.GetnodalEntryRegisterwithoutS]);   //Get non serial stamps Entry Details//

router.post('/deletenodalEntryRegisterS',verifyjwt,[handler.DeletenodalEntryRegisterS]);  //delete serial stamps Entry Details//
router.post('/deletenodalEntryRegisterwithoutS',verifyjwt,[handler.DeletenodalEntryRegisterwithoutS]);  //delete non serial stamps Entry Details//

router.post('/deleteNodalDistriwithS',verifyjwt,[handler.DeleteNodalDistriwithS])   //delete distributed serial stamps  from dr's//
router.post('/deleteNodalDistriwithOutS',verifyjwt,[handler.DeleteNodalDistriwithOutS]) //delete distributed non serial stamps  from dr's//

router.get('/getDistri',verifyjwt,[handler.getDistri]);  //Get serial stamps DR Distributed Details//
router.get('/getDistriWithoutSerial',verifyjwt,[handler.getDistriWithoutSerial]); //Get non serial stamps DR Distributed Details//

router.get('/getNodalDistri',verifyjwt,[handler.getNodalDistri]); //Get serial stamps Nodal Distributed Details//
router.get('/getNodalDistriWithoutSerial',verifyjwt,[handler.getNodalDistriWithoutSerial]); //Get Non serial stamps Nodal Distributed Details//

router.get('/getSrosAsperdiststamps',verifyjwt,[handler.getSrosAsperdiststamps]);  //Get SRO'S LIST Details Where Under DR Distributed for srial stamps//
router.get('/getSrosAsperdiststampsout',verifyjwt,[handler.getSrosAsperdiststampsout]); //Get SRO'S LIST Details Where Under DR Distributed Non Serial stamps//
 
router.get('/getDistrictsAsperdiststamps',verifyjwt,[handler.getDistrictsAsperdiststamps]);  //Get DR'S LIST Details Where Under Nodal Distributed for serial stamps//
router.get('/getDistrictsAsperdiststampsout',verifyjwt,[handler.getDistrictsAsperdiststampsout]); //Get DR'S LIST Details Where Under Nodal Distributed for Non serial stamps//


router.get('/getbalancestampsforwithserail',verifyjwt,[handler.getbalancestampsforwithserail]); //Get Balance Serial Stamps Details for NODAL , DR,SRO Based On FROM_OFFICE code we will get NODAL (OR) DR (OR) SRO//
router.get('/getbalancestampsforwithOutserail',verifyjwt,[handler.getbalancestampsforwithOutserail]); //Get Balance Non Serial Stamps Details for NODAL , DR,SRO Based On FROM_OFFICE code we will get NODAL (OR) DR (OR) SRO//

router.get('/getVenderlist',verifyjwt,[handler.getVenderlist]); //Get VenderList Under SRO office//
router.post('/SroCitizenDistri',verifyjwt,[handler.SroCitizenDistri]) //Saving buyer citizen details //


router.get('/getBlockedVenderlistforDr',verifyjwt,[handler.getBlockedVenderlistforDr]); //Get VenderList Under DR office//
router.get('/getVenderlistforDr',verifyjwt,[handler.getVenderlistforDr]); //Get VenderList Under DR office//
router.post('/blockVender',verifyjwt,[handler.blockVender]) //Block Vender for Temporary//
router.post('/UnblockVender',verifyjwt,[handler.UnblockVender]) //UnBlock Vender //


router.get('/getboxmainfromtoforwithserail',verifyjwt,[handler.getboxmainfromtoforwithserail]); //Get box //
router.get('/getmainfromtoforwithserail',verifyjwt,[handler.getmainfromtoforwithserail]); //Get main//
router.get('/Checkdate',verifyjwt,[handler.Checkdate]) // Checkdate //


router.get('/getfromtoforwithserail',verifyjwt,[handler.getfromtoforwithserail]); //get from and to//

router.get('/getSerialMainstockDateList',verifyjwt,[handler.getSerialMainstockDateList]); //get SerialMainstock DateList for Nodal officer//
router.get('/getNonSerialMainstockDateList',verifyjwt,[handler.getNonSerialMainstockDateList]); //get NonSerialMainstock DateList for Nodal officer//
router.get('/getDistributedSerialStampsDateList',verifyjwt,[handler.getDistributedSerialStampsDateList]); //get Distributed SerialStamps DateList for Nodal officer OR DR OR SRO Single API FOR 3 MEMBERS//
router.get('/getDistributedNONSerialStampsDateList',verifyjwt,[handler.getDistributedNONSerialStampsDateList]); //get Distributed NONSerialStamps DateList for Nodal officer OR DR OR SRO Single API FOR 3 MEMBERS//
router.get('/getSroToVenderDistri',verifyjwt,[handler.getSroToVenderDistri]); // Get SRO TO VENDER DISTRIBUTED SERIAL STAMPS DETAILS //
router.get('/getBalanceSNOMAIN',verifyjwt,[handler.getBalanceSNOMAIN]); // get SNO_MAIN LIST NODAL ,DR,SRO //
router.get('/getBlockedStampsList',verifyjwt,[handler.getBlockedStampsList]); // get Blocked stamps LIST SRO //
router.get('/getBlockedStampsLists',verifyjwt,[handler.getBlockedStampsLists]); // get serial Blocked stamps LIST SRO //
router.post('/UnblockStamps',verifyjwt,[handler.UnblockStamps]) //UnBlock stamps //
router.get('/getIndentFormFromPde',verifyjwt,[handler.getIndentFormFromPde]); // Get SERIAL Indents forms //
router.get('/getIndentFormFromPdeNONSerial',verifyjwt,[handler.getIndentFormFromPdeNONSerial]); // Get NON SERIAL Indents forms //
router.get('/getIndentFormVENDER',verifyjwt,[handler.getIndentFormVENDER]); // Get VENDER Indents forms //
router.post('/updateIndentStatus',verifyjwt,[handler.updateIndentStatus]) //UnBlock stamps //
router.post('/partialRevertBack',verifyjwt,[handler.partialRevertBack]) //Revert back stamps partially //
router.post('/VendorRevertBack',verifyjwt,[handler.VendorRevertBack]) //Revert back stamps partially //
router.post('/VendorAvailableStampsCheckNew',verifyjwt,[handler.VendorAvailableStampsCheckNew]) //Revert back stamps partially //
router.get('/getDistributedSerialVendorStampsDateList',verifyjwt,[handler.getDistributedSerialVendorStampsDateList]); //get Distributed SerialStamps DateList for Nodal officer OR DR OR SRO Single API FOR 3 MEMBERS//




//-----------------Vendor courtfeelabels distri------------------//

router.get('/getStampNamesnVendor',verifyjwt,[handler.getStampNamesnVendor]);         //to get non serial stamp details//
router.get('/getIndentFormVENDERNonSerial',verifyjwt,[handler.getIndentFormVENDERNonSerial]); // Get VENDER Indents forms //
router.post('/NodalDistriwithoutSForVendor',verifyjwt,[handler.NodalDistriwithoutSForVendor]); //Nodal officer Non serial stamps Distruibution to dr's//








//------------------SRO ---  Distributed Reports Routes-----------------------//

router.get('/getSroToVenderDistriReport',verifyjwt,[handler.getSroToVenderDistriReport]);

router.get('/getSroToCitizenDistriReport',verifyjwt,[handler.getSroToCitizenDistriReport]);
router.get('/getSroToCitizenDistriNReport',verifyjwt,[handler.getSroToCitizenDistriNReport]);



//------------------DR ---  Distributed Reports Routes-----------------------//

router.get('/getDRDistriReport',verifyjwt,[handler.getDRDistriReport]);
router.get('/getDRDistriWithoutSerialReport',verifyjwt,[handler.getDRDistriWithoutSerialReport]);

//------------------NODAL ---  Distributed Reports Routes-----------------------//

router.get('/getNodalDistriReport',verifyjwt,[handler.getNodalDistriReport]);
router.get('/getNodalDistriWithoutSerialReport',verifyjwt,[handler.getNodalDistriWithoutSerialReport]);

//------------------NODAL ---  MAIN STOCK STAMP ENTRY Reports Routes-----------------------//

router.get('/getMAINSerialEntryReport',verifyjwt,[handler.getMAINSerialEntryReport]);
router.get('/getMAINEntryReport',verifyjwt,[handler.getMAINEntryReport]);


// ----------------BALANCE STAMPS REPORTS FOR NODAL & DR & SRO ---------- ONLY FROM OFFICE CODE WILL CHANGE---------//

router.get('/getVendorBalancestockreport',verifyjwt,[handler.getVendorBalancestockreport]);
router.get('/getVendorBalanceSerilaStampsReport2',verifyjwt,[handler.getVendorBalanceSerilaStampsReport2]);
router.get('/getVendorBalanceSerilaStampsReport3',verifyjwt,[handler.getVendorBalanceSerilaStampsReport3]);



router.get('/getBalanceSerilaStampsReport',verifyjwt,[handler.getBalanceSerilaStampsReport]);
router.get('/getBalanceSerilaStampsReport2',verifyjwt,[handler.getBalanceSerilaStampsReport2]);
router.get('/getBalanceSerilaStampsReport3',verifyjwt,[handler.getBalanceSerilaStampsReport3]);
router.get('/getBalanceNONSerilaStampsReport',verifyjwt,[handler.getBalanceNONSerilaStampsReport]);

//---------------Reverse indent forms api's-------------------------------For sro,dr---------------------//
router.get('/getFilledIndentRows',verifyjwt,[handler.getFilledIndentRows]);
router.post('/insertInternalIndentDetails',verifyjwt,[handler.insertInternalIndentDetails]) ;
router.post('/vendorCreation',verifyjwt,[handler.vendorCreation]);
router.post('/submitIndent',verifyjwt,[handler.submitIndent]) 
router.post('/closeDistributedIndent',verifyjwt,[handler.closeDistributedIndent]) 
router.post('/deleteRow',verifyjwt,[handler.deleteRow]) 
router.get('/generateDocumentId',verifyjwt,[handler.generateDocumentId]);
router.get('/getDRcode',verifyjwt,[handler.getDRcode]);
router.get('/getInternalSerialIndent',verifyjwt,[handler.getInternalSerialIndent]);
router.get('/getInternalNONSerialIndent',verifyjwt,[handler.getInternalNONSerialIndent]);
router.get('/getPdfStampsPrint',verifyjwt,[handler.getPdfStampsPrint]);


router.get('/getVenderlistforresurendr',verifyjwt,[handler.getVenderlistforresurendr]); 
router.get('/getVenderlistforaadharseed',verifyjwt,[handler.getVenderlistforaadharseed]); //Get VenderList Under SRO office//
router.post('/vendorAadharUpdate',verifyjwt,[handler.vendorAadharUpdate]);

// ------abstract reports under dr and nodal-----------------------------
router.get('/getSrSaleUnderDrReport',verifyjwt,[handler.getSrSaleUnderDrReport]);
router.get('/getSrSaleUnderNodalReport',verifyjwt,[handler.getSrSaleUnderNodalReport]);

router.get('/getSrSaleUnderDrReportPdf',verifyjwt,[handler.getSrSaleUnderDrReportPdf]);
router.get('/getSrSaleUnderNodalReportPdf',verifyjwt,[handler.getSrSaleUnderNodalReportPdf]);



router.get('/getVerifyVENDERIndent',verifyjwt,[handler.getVerifyVENDERIndent]); // Get VENDER Indents forms //
router.post('/UpdateVendorIndentVerifyStatus',verifyjwt,[handler.UpdateVendorIndentVerifyStatus]) 
router.post('/UpdateVendorIMainStatus',verifyjwt,[handler.UpdateVendorIMainStatus]) 






//--API'S RELATED TO MISCLENIOUS CASH RECEIPT UNDER STAMPS INDENT-----RP WRITTEN----------//

router.get('/stamptypelist',verifyjwt,[handler.stamptypelisthndlr]);
router.get('/denominationslist',verifyjwt,[handler.denominationslisthndl]);
router.get('/getstampavailablelist',verifyjwt,[handler.getstampavailablelisthndlr])
 


  //------------------START-----------------------------------ESIGN SKIP PROCESS API'S 3 IG LOGIN--------------------------------------------------//
  router.get('/getEsignSkipStatus',verifyjwt,[handler.getEsignSkipStatus]);    
  router.put('/SkipOrEnableEsign',verifyjwt,[handler.SkipOrEnableEsign]);    
  router.put('/getEsignSkipStatusDoc',verifyjwt,[handler.getEsignSkipStatusDoc]); 
    //------------------END-----------------------------------ESIGN SKIP PROCESS API'S 3 IG LOGIN--------------------------------------------------//
  

//Stamps Stock Report for Nodal Login
router.get('/getStampAvilReportDist',verifyjwt,[handler.getDistStampReport]);
router.get('/getStampAvilReportSro',verifyjwt,[handler.geSroStampReport]);
router.get('/getStampSroAvilReport',verifyjwt,[handler.geStampReportSro]);   
router.post('/stampsDistStockReport',verifyjwt,[handler.getstampsstockDistReport]);
router.post('/stampsSRdownload',verifyjwt,[handler.getStampsSROReport]);



module.exports = router;