const express = require('express');
const tdAllocationsHandler = require('../handlers/tdAllocationsHandler');

const handler = new tdAllocationsHandler();
const router = express.Router();
const { verifyjwt } = require('../plugins/auth/authService');



router.get('/getTdAllocationReport1', verifyjwt, [handler.getTdAllocationReport1]);
router.get('/getTdAllocationReport2', verifyjwt, [handler.getTdAllocationReport2]);
router.get('/getReport1PdfGenerate1', verifyjwt, [handler.getReport1PdfGenerate1]);
router.get('/getReport1PdfGenerate2', verifyjwt, [handler.getReport1PdfGenerate2]);

router.get('/getTdAllocationReport1A', verifyjwt, [handler.getTdAllocationReport1A]);
router.get('/getTdAllocationReport2A', verifyjwt, [handler.getTdAllocationReport2A]);
router.get('/getReport1PdfGenerate1A', verifyjwt, [handler.getReport1PdfGenerate1A]);
router.get('/getReport1PdfGenerate2A', verifyjwt, [handler.getReport1PdfGenerate2A]);

router.get('/getTdAllocationReport1B', verifyjwt, [handler.getTdAllocationReport1B]);
router.get('/getTdAllocationReport2B', verifyjwt, [handler.getTdAllocationReport2B]);
router.get('/getReport1PdfGenerate1B', verifyjwt, [handler.getReport1PdfGenerate1B]);
router.get('/getReport1PdfGenerate2B', verifyjwt, [handler.getReport1PdfGenerate2B]);

router.get('/tdAllocationReportFormC', verifyjwt,  [handler.tdAllocationReportFormC]);
router.get('/tdAllocationReportForm2C', verifyjwt, [handler.tdAllocationReportForm2C]);
router.get('/report1PdfGenerateForm1C', verifyjwt, [handler.report1PdfGenerateForm1C]);
router.get('/report1PdfGenerateForm2C', verifyjwt, [handler.report1PdfGenerateForm2C]);

router.get('/tdAllocationReportFormD',  verifyjwt, [handler.tdAllocationReportFormD]);
router.get('/tdAllocationReportForm2D', verifyjwt, [handler.tdAllocationReportForm2D]);
router.get('/report1PdfGenerateForm1D', verifyjwt, [handler.report1PdfGenerateForm1D]);
router.get('/report1PdfGenerateForm2D', verifyjwt, [handler.report1PdfGenerateForm2D]);

router.get('/tdAllocationReportFormE',  verifyjwt, [handler.tdAllocationReportFormE]);
router.get('/tdAllocationReportForm2E', verifyjwt, [handler.tdAllocationReportForm2E]);
router.get('/report1PdfGenerateForm1E', verifyjwt, [handler.report1PdfGenerateForm1E]);
router.get('/report1PdfGenerateForm2E', verifyjwt, [handler.report1PdfGenerateForm2E]);

router.get('/tdAllocationReportFormF',  verifyjwt, [handler.tdAllocationReportFormF]);
router.get('/tdAllocationReportForm2F', verifyjwt, [handler.tdAllocationReportForm2F]);
router.get('/report1PdfGenerateForm1F', verifyjwt, [handler.report1PdfGenerateForm1F]);
router.get('/report1PdfGenerateForm2F', verifyjwt, [handler.report1PdfGenerateForm2F]);

router.get('/tdAllocationReportFormG',  verifyjwt, [handler.tdAllocationReportFormG]);
router.get('/tdAllocationReportForm2G', verifyjwt, [handler.tdAllocationReportForm2G]);
router.get('/report1PdfGenerateForm1G', verifyjwt, [handler.report1PdfGenerateForm1G]);
router.get('/report1PdfGenerateForm2G', verifyjwt, [handler.report1PdfGenerateForm2G]);

router.get('/tdAllocationReportFormH',  verifyjwt, [handler.tdAllocationReportFormH]);
router.get('/tdAllocationReportForm2H', verifyjwt, [handler.tdAllocationReportForm2H]);
router.get('/report1PdfGenerateForm1H', verifyjwt, [handler.report1PdfGenerateForm1H]);
router.get('/report1PdfGenerateForm2H', verifyjwt, [handler.report1PdfGenerateForm2H]);

router.get('/tdAllocationReportFormI',  verifyjwt, [handler.tdAllocationReportFormI]);
router.get('/tdAllocationReportForm2I', verifyjwt, [handler.tdAllocationReportForm2I]);
router.get('/report1PdfGenerateForm1I', verifyjwt, [handler.report1PdfGenerateForm1I]);
router.get('/report1PdfGenerateForm2I', verifyjwt, [handler.report1PdfGenerateForm2I]);

router.get('/tdAllocationReportFormJ',  verifyjwt, [handler.tdAllocationReportFormJ]);
router.get('/tdAllocationReportForm2J', verifyjwt, [handler.tdAllocationReportForm2J]);
router.get('/report1PdfGenerateForm1J', verifyjwt, [handler.report1PdfGenerateForm1J]);
router.get('/report1PdfGenerateForm2J', verifyjwt, [handler.report1PdfGenerateForm2J]);

router.get('/tdAllocationReportFormK',  verifyjwt, [handler.tdAllocationReportFormK]);
router.get('/tdAllocationReportForm2K', verifyjwt, [handler.tdAllocationReportForm2K]);
router.get('/report1PdfGenerateForm1K', verifyjwt, [handler.report1PdfGenerateForm1K]);
router.get('/report1PdfGenerateForm2K', verifyjwt, [handler.report1PdfGenerateForm2K]);

router.get('/tdAllocationReportFormL',  verifyjwt, [handler.tdAllocationReportFormL]);
router.get('/tdAllocationReportForm2L', verifyjwt, [handler.tdAllocationReportForm2L]);
router.get('/report1PdfGenerateForm1L', verifyjwt, [handler.report1PdfGenerateForm1L]);
router.get('/report1PdfGenerateForm2L', verifyjwt, [handler.report1PdfGenerateForm2L]);

router.get('/tdAllocationReportFormM',  verifyjwt, [handler.tdAllocationReportFormM]);
router.get('/tdAllocationReportForm2M', verifyjwt, [handler.tdAllocationReportForm2M]);
router.get('/report1PdfGenerateForm1M', verifyjwt, [handler.report1PdfGenerateForm1M]);
router.get('/report1PdfGenerateForm2M', verifyjwt, [handler.report1PdfGenerateForm2M]);

router.get('/tdAllocationReportFormN',  verifyjwt, [handler.tdAllocationReportFormN]);
router.get('/tdAllocationReportForm2N', verifyjwt, [handler.tdAllocationReportForm2N]);
router.get('/report1PdfGenerateForm1N', verifyjwt, [handler.report1PdfGenerateForm1N]);
router.get('/report1PdfGenerateForm2N', verifyjwt, [handler.report1PdfGenerateForm2N]);

router.get('/tdAllocationReportFormO',  verifyjwt, [handler.tdAllocationReportFormO]);
router.get('/tdAllocationReportForm2O', verifyjwt, [handler.tdAllocationReportForm2O]);
router.get('/report1PdfGenerateForm1O', verifyjwt, [handler.report1PdfGenerateForm1O]);
router.get('/report1PdfGenerateForm2O', verifyjwt, [handler.report1PdfGenerateForm2O]);

module.exports = router;