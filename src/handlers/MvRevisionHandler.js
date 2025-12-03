const MvRevisionServices = require('../services/mvRevisionServices');
const { constructCARDError } = require("./errorHandler");
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');





class MvRevisionHandler {
    constructor() {
        this.mvrevisionServices = new MvRevisionServices();

    };
    testAPI = async (req, res) => {
        try {
            let response = await this.mvrevisionServices.testAPI();;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            return res.status(400).send(
                {
                    status: false,
                    message: ex
                }
            );
        }
    }

    sendEnableRequest = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.enableRequest(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - sendEnableRequest || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getAreaClass = async (req, res) => {      
       try {
            let response = await this.mvrevisionServices.getAreaClass();;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getAreaClass || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getLocalBodyDirData = async (req, res) => {      
        try {
             let response = await this.mvrevisionServices.getLocalBodyDir();;
             let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
         } catch (ex) {
             console.error("MvRevisionHandler - getLocalBodyDirData || Error :", ex);
             var cardError = constructCARDError(ex);
             return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                 {
                     status: false,
                     message: cardError.message
                 }
             );
         }
     }
    getForm4Data = async (req, res) => {
        const qParams = req.query;
        if (qParams.sro_code == null && qParams.rev_vill_code == null && qParams.classification == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm4Data(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getForm4Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updateForm4Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form4Data == null || !Array.isArray(reqBody.form4Data)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.updateForm4(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - updateForm4Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updateMvRevisionReq = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.SR_CODE == null && reqBody.VILLAGE_CODE == null && reqBody.NATURE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.updateMvRevision(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - updateMcRevisionReq || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteForm4Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.rowid == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.deleteForm4(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - deleteForm4Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    addForm4Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form4Data == null || !Array.isArray(reqBody.form4Data)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.addForm4(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - addForm4Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    //Form4 APIs
    getForm3Data = async (req, res) => {
        const qParams = req.query;
        if (qParams.sro_code == null && qParams.rev_vill_code == null && qParams.classification == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm3(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getForm3Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getMvRequestList = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getMvRequests(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getMvRequestList || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updateForm3Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form3Data  == null || !Array.isArray(reqBody.form3Data)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.updateForm3(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - updateForm3Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteForm3Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.rowid == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.deleteForm3(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - deleteForm3Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    addForm3Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form3Data == null || !Array.isArray(reqBody.form3Data) ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.addForm3(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - addForm3Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    //Form1 APIS
    getHabitations = async (req, res) => {
        const qParams = req.query;
        if (qParams.sro_code == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getHabitations(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getHabitationList || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getForm1Data = async (req, res) => {
        const qParams = req.query;
        if (qParams.sro_code == null || qParams.habitation == null || qParams.ward_no == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm1(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getForm1WardData = async (req, res) => {
        const qParams = req.query;
        if (qParams.sro_code == null || qParams.habitation == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm1Ward(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    updateForm1Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form1Data == null || !Array.isArray(reqBody.form1Data)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.updateForm1(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - updateForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteForm1Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.rowid == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.deleteForm1(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - deleteForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    addForm1Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form1Data == null || !Array.isArray(reqBody.form1Data )) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.addForm1(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - addForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    //Form2 apis
    getForm2Data = async (req, res) => {
        const qParams = req.query;
        if (qParams.habitation == null || qParams.sro_code == null || qParams.ward_no == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm2(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getForm2Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getForm2WardData = async (req, res) => {
        const qParams = req.query;
        if (qParams.habitation == null || qParams.sro_code == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm2WardList(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getForm2Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    updateForm2Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form2Data == null || !Array.isArray(reqBody.form2Data)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.updateForm2(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - updateForm2Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteForm2Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.rowid == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.deleteForm2(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - deleteForm2Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    addForm2Data = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.form2Data == null || !Array.isArray(reqBody.form2Data )) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.addForm2(reqBody);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - addForm2Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getServeyNo = async (req, res) => {
        const qParams = req.query;
        if (qParams.sro_code == null || qParams.vill_code == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getServeyNo(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getServeyNo || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    insertServeyNo = async (req, res) => {
        const qParams = req.body;
        if (qParams.sro_code == null || qParams.vill_code == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.insertServeyNo(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getServeyNo || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteServeyNo = async (req, res) => {
        const qParams = req.body;
        if (qParams.sro_code == null || qParams.vill_code == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.deleteServeyNo(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getServeyNo || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    makeEffectiveRequest = async (req, res) => {
        const qParams = req.body;
        if (qParams.SR_CODE == null || qParams.VILL_CODE == null || qParams.STATUS == null || qParams.NATURE == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.makeEffectiveRequest(qParams);;
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - makeEffectiveRequest || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getForm1PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm1PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    

    getForm2PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm2PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    
    getForm3PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm3PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }



    getForm4PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm4PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }



    getSurveyNoList = async (req, res) => {
        const qParams = req.query;
        if (qParams.VILL_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getSurveyNoListSrvc(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getSurveyNoList || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    getForm1PdfGenerateData = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm1PdfGenerateData(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1PdfGenerateData || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    

    getForm2PdfGenerateData = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm2PdfGenerateData(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm2PdfGenerateData || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    
    getForm3PdfGenerateData = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm3PdfGenerateData(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm3PdfGenerateData || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }



    getForm4PdfGenerateData = async (req, res) => {
        const qParams = req.query;
        if (qParams.SRO_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getForm4PdfGenerateData(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm4PdfGenerateData || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    getMakeEffectiveRequestBySro = async (req, res) => {
        const qParams = req.query;
        if (qParams.DR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getMakeEffectiveRequestBySro(qParams);;
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getMvRequestList || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    makeEffectiveFinalDRApprove = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.SR_CODE == null || reqBody.DR_CD == null || reqBody.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.makeEffectiveFinalDRApprove(reqBody);;
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - makeEffectiveFinalDRApprove || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    getMakeEffectiveRequestBySroStatus = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getMakeEffectiveRequestBySroStatus(qParams);;
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getMakeEffectiveRequestBySroStatus || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getMvRequestsStatus = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getMvRequestsStatus(qParams);;
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("MvRevisionHandler - getMvRequestsStatus || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getSurveyNoAccordtoJuriAdded = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILL_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getSurveyNoAccordtoJuriAdded(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getSurveyNoAccordtoJuriAdded || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getLpmCheck = async (req, res) => {
        const qParams = req.query;
        if (qParams.VILL_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getLpmCheck(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getLpmCheck || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getUrbanJurisdiction = async (req, res) => {
        const qParams = req.query;
        if (qParams.habitation == null || qParams.sr_code == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.getUrbanJurisdictionSrvc(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getUrbanJurisdiction || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    insertUrbanJurisdiction = async (req, res) => {
        const qParams = req.body;
        if (qParams.HABITATION == null || qParams.SR_CODE == null || qParams.WARD_NO == null || qParams.BLOCK_NO == null|| qParams.LOCAL_BODY_NAME == null || qParams.LOCAL_BODY_CODE == null || qParams.USERNAME == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.mvrevisionServices.insertUrbanJurisdictionSrvc(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getUrbanJurisdiction || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }



}
module.exports = MvRevisionHandler;




