const express = require('express')
const CardMasterHandler = require('../handlers/cardMasterHandler');
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new CardMasterHandler();
const router = express.Router();

router.get('/getDig',[handler.selectDig])
router.get('/getDR',[handler.selectDR])
router.get('/:type',[handler.landingPages])
router.post('/:type',[handler.saveMasters])
router.delete('/delete',[handler.deleteDR]);
router.delete('/deleteLocalbody',[handler.deleteLocalbody])
router.delete('/jobs',[handler.deleteJobs])
router.delete('/landUse',[handler.deleteLandUse])
router.delete('/deleteProhibition',[handler.deleteProhibition]);
router.get('/SRM/dr',[handler.getSRM])
router.get('/length/SR',handler.selectLength)
router.delete('/delete/srcode',[handler.deleteSRMasters])
router.delete('/deleteMinor',[handler.deleteMinor])
module.exports = router;