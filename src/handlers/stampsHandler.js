const stampsService = require('../services/stampsServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class stampsHandler {
    constructor() {
        this.stampsHandlerServices = new stampsService();
    }

    getStampNames = async (req,res) => {   
		try{
            let response = await this.stampsHandlerServices.getStampNames();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("stampsHandler - getStampNames || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }
    getStampForIndent =async (req,res) => {   
		try{
            let response = await this.stampsHandlerServices.getStampForIndent();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("stampsHandler - getStampForIndent || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }
    getStampNamesn = async (req,res) => {   
		try{
            let response = await this.stampsHandlerServices.getStampNamesn();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("stampsHandler - getStampNamesn || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }
    getstampCatTypeDeno = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.stampsHandlerServices.getstampCatTypeDeno(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("stampsHandler - getstampCatTypeDeno || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }
    getstampDeno = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.stampsHandlerServices.getstampDeno(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("stampsHandler - getstampDeno || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }
    NodalEntryRegisterEntryWithS = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.stamps == null || !Array.isArray(reqBody.stamps)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.stampsHandlerServices.nodalEntryRegisterEntryWithS(reqBody);;
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
            console.error("stampsHandler - NodalEntryRegisterEntryWithS || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    NodalEntryRegisterEntryWithoutS = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.stamps == null || !Array.isArray(reqBody.stamps)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.stampsHandlerServices.nodalEntryRegisterEntryWithoutS(reqBody);;
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
            console.error("stampsHandler - NodalEntryRegisterEntryWithoutS || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    NodalDistriwithS = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.stamps == null || !Array.isArray(reqBody.stamps)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.stampsHandlerServices.NodalDistriwithS(reqBody);;
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
            console.error("stampsHandler - NodalDistriwithS || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    NodalDistriwithoutS = async (req, res) => {
        const reqBody = req.body;
        if (reqBody.stamps == null || !Array.isArray(reqBody.stamps)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.stampsHandlerServices.NodalDistriwithoutS(reqBody);;
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
            console.error("stampsHandler - NodalDistriwithoutS || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    

DeletenodalEntryRegisterS = async (req, res) => {
    const reqQuery = req.body;

    if (!reqQuery.FROM_OFFICE || !reqQuery.DENOMINATION ||
        !reqQuery.CATEGORY || !reqQuery.TYPE || !reqQuery.RECEIVED_DATE || !reqQuery.BUNDLE_NO ||
        !reqQuery.SERIAL_NO_FROM || !reqQuery.SERIAL_NO_TO || !reqQuery.SNO_MAIN) {

        console.error("Validation Error: Do not Send Null In Any Parameter");
        return res.status(400).send({ message: "Validation Error: Do not Send Null In Any Parameter" });
    }

    try {
        let response = await this.stampsHandlerServices.DeletenodalEntryRegisterS(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send(responseData);
    } catch (ex) {
        console.error("stampsHandler - DeletenodalEntryRegisterS || Error:", ex);

        if (ex.statusCode) {
            // Custom error with specific status code
            return res.status(ex.statusCode).send({
                status: false,
                message: ex.message
            });
        }

        // Default error handling
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
}
DeletenodalEntryRegisterwithoutS = async (req, res) => {
    const reqQuery = req.body;   
    if (reqQuery.RECEIVED_DATE == null) {
        console.error("Validation Error: RECEIVED_DATE is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }

    try {
        let response = await this.stampsHandlerServices.DeletenodalEntryRegisterwithoutS(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - DeletenodalEntryRegisterwithoutS || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

GetnodalEntryRegisterS = async (req, res) => {
    const reqQuery = req.query;   
    if (reqQuery.RECEIVED_DATE == null) {
        console.error("Validation Error: RECEIVED_DATE is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }

    try {
        let response = await this.stampsHandlerServices.GetnodalEntryRegisterS(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - GetnodalEntryRegisterS || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
GetnodalEntryRegisterwithoutS = async (req, res) => {
    const reqQuery = req.query;   
    if (reqQuery.RECEIVED_DATE == null) {
        console.error("Validation Error: RECEIVED_DATE is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }

    try {
        let response = await this.stampsHandlerServices.GetnodalEntryRegisterwithoutS(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - GetnodalEntryRegisterwithoutS || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

DeleteNodalDistriwithS = async (req, res) => {
    const reqQuery = req.body;   
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null || reqQuery.TO_OFFICE == null || reqQuery.DENOMINATION == null || reqQuery.STAMP_CODE == null  || reqQuery.SNO_MAIN == null || reqQuery.BUNDLE_NO == null) {
        console.error("Validation Error: RECEIVED_DATE is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }

    try {
        let response = await this.stampsHandlerServices.DeleteNodalDistriwithS(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - DeleteNodalDistriwithS || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
DeleteNodalDistriwithOutS = async (req, res) => {
    const reqQuery = req.body;   
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null || reqQuery.TO_OFFICE == null || reqQuery.DENOMINATION == null || reqQuery.STAMP_CODE == null) {
        console.error("Validation Error: RECEIVED_DATE is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }

    try {
        let response = await this.stampsHandlerServices.DeleteNodalDistriwithOutS(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - DeleteNodalDistriwithOutS || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getDistri = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDistri(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistri || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getNodalDistri = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getNodalDistri(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistri || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getDistriWithoutSerial = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDistriWithoutSerial(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistriWithoutSerial || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getNodalDistriWithoutSerial = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getNodalDistriWithoutSerial(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistriWithoutSerial || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getDistrictsAsperdiststamps = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDistrictsAsperdiststamps(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistrictsAsperdiststamps || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSrosAsperdiststamps  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSrosAsperdiststamps(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getSrosAsperdiststamps || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getDistrictsAsperdiststampsout = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDistrictsAsperdiststampsout(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistrictsAsperdiststampsout || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSrosAsperdiststampsout  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.RECEIVED_DATE == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSrosAsperdiststampsout(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getSrosAsperdiststampsout || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getbalancestampsforwithserail  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getbalancestampsforwithserail(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getbalancestampsforwithOutserail = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getbalancestampsforwithOutserail(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getVenderlist = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVenderlist(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getVenderlistforresurendr = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.RECEIVED_DATE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVenderlistforresurender(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getVenderlistforresurendr || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
SroCitizenDistri  = async (req, res) => {
    const reqBody = req.body;
    if (reqBody.stampsCitizen == null || !Array.isArray(reqBody.stampsCitizen)) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.stampsHandlerServices.SroCitizenSaleDetails(reqBody);;
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
        console.error("stampsHandler - NodalDistriwithS || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getVenderlistforDr = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.DR_CD == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVenderlistforDr(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getBlockedVenderlistforDr  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.DR_CD == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBlockedVenderlistforDr(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

blockVender = async (req, res) => {
    const reqQuery = req.body;   
    if (reqQuery.DR_CD == null || reqQuery.SR_CD == null || reqQuery.LICENSE_NO == null || reqQuery.REASON == null ) {
        console.error("Validation Error: LICENSE_NO is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.stampsHandlerServices.blockVender(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - BlockVender || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

UnblockVender =  async (req, res) => {
    const reqQuery = req.body;   
    if (reqQuery.DR_CD == null || reqQuery.SR_CD == null || reqQuery.LICENSE_NO == null || reqQuery.REASON == null) {
        console.error("Validation Error: LICENSE_NO is null");
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.stampsHandlerServices.UnblockVender(reqQuery);
        let responseData = {
            status: true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});
    } catch (ex) {
        console.error("stampsHandler - UnblockVender || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getboxmainfromtoforwithserail  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getboxmainfromtoforwithserail(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getmainfromtoforwithserail = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getmainfromtoforwithserail(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getmainfromtoforwithserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getfromtoforwithserail  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getfromtoforwithserail(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSerialMainstockDateList = async (req,res) => {   
    try{
        let response = await this.stampsHandlerServices.getSerialMainstockDateList();
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getSerialMainstockDateList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getNonSerialMainstockDateList = async (req,res) => {   
    try{
        let response = await this.stampsHandlerServices.getNonSerialMainstockDateList();
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNonSerialMainstockDateList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getDistributedSerialStampsDateList = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getDistributedSerialStampsDateList(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistributedSerialStampsDateList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getDistributedSerialVendorStampsDateList = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getDistributedSerialVendorStampsDateList(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistributedSerialVendorStampsDateList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getDistributedNONSerialStampsDateList = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getDistributedNONSerialStampsDateList(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDistributedNONSerialStampsDateList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getIndentFormFromPde = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getIndentFormFromPdeSerial(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getIndentFormFromPde || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getIndentFormFromPdeNONSerial = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getIndentFormFromPdeNONSerial(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getIndentFormFromPde || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getIndentFormVENDER = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getIndentFormVENDER(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getIndentFormFromPde || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

updateIndentStatus = async (req,res) => { 
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null||reqQuery.RECEIPT_NO == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.updateIndentStatus(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - updateIndentStatus || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getSroToVenderDistri = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null|| reqQuery.RECEIVED_DATE == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getSroToVenderDistri(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getIndentFormFromPde || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

// ---------------------------------Distributed reports handlers-------------------

getDRDistriReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDRDistriReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDRDistriReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getNodalDistriReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getNodalDistriReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistriReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getDRDistriWithoutSerialReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDRDistriWithoutSerialReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDRDistriWithoutSerialReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getNodalDistriWithoutSerialReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getNodalDistriWithoutSerialReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistriWithoutSerialReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSroToVenderDistriReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSroToVenderDistriReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistriWithoutSerialReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getSroToCitizenDistriReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSroToCitizenDistriReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistriWithoutSerialReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSroToCitizenDistriNReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSroToCitizenDistriNReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getNodalDistriWithoutSerialReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getMAINSerialEntryReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getMAINSerialEntryReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getMAINSerialEntryReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getMAINEntryReport  = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getMAINEntryReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getMAINEntryReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getVendorBalancestockreport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVendorBalancestockreport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getVendorBalancestockreport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getBalanceSerilaStampsReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBalanceSerilaStampsReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBalanceSerilaStampsReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getVendorBalanceSerilaStampsReport2 =async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.DENOMINATION == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVendorBalanceSerilaStampsReport2(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getVendorBalanceSerilaStampsReport2 || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getBalanceSerilaStampsReport2 = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.DENOMINATION == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBalanceSerilaStampsReport2(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBalanceSerilaStampsReport2 || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getVendorBalanceSerilaStampsReport3 =  async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.DENOMINATION == null || reqQuery.BUNDLE_NO == null || reqQuery.SNO_MAIN == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVendorBalanceSerilaStampsReport3(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getVendorBalanceSerilaStampsReport3 || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getBalanceSerilaStampsReport3 = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.DENOMINATION == null || reqQuery.BUNDLE_NO == null || reqQuery.SNO_MAIN == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBalanceSerilaStampsReport3(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBalanceSerilaStampsReport3 || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getBalanceNONSerilaStampsReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBalanceNONSerilaStampsReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBalanceNONSerilaStampsReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getBalanceSNOMAIN = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBalanceSNOMAIN(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBalanceSNOMAIN || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getBlockedStampsList = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBlockedStampsList(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBlockedStampsList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getBlockedStampsLists = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBlockedStampsLists(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBlockedStampsList || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
    UnblockStamps = async (req, res) => {
        const reqQueryArray = req.body.stamps; // Expecting an array of objects
    
        // Validate input
        for (const reqQuery of reqQueryArray) {
            if (!reqQuery.FROM_OFFICE || !reqQuery.DENOMINATION || !reqQuery.STAMP_CODE || !reqQuery.CATEGORY || !reqQuery.TYPE || !reqQuery.NUMBER) {
                console.error("Validation Error: Do not Send Null In Any Parameter");
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                    message: NAMES.VALIDATION_ERROR
                });
                return;
            }
        }
    
        try {
            const responses = [];
            // Iterate over the array of records and process each one
            for (const reqQuery of reqQueryArray) {
                let response = await this.stampsHandlerServices.UnblockSingleStamp(reqQuery);
                responses.push(response);
            }
    
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: responses
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("stampsHandler - UnblockStamps || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
                status: false,
                message: cardError.message
            });
        }
    };
    

// UnblockStamps =  async (req, res) => {
//     const reqQuery = req.body;   
//     if (reqQuery.FROM_OFFICE == null || reqQuery.DENOMINATION == null || reqQuery.STAMP_CODE == null ||reqQuery.CATEGORY == null ||reqQuery.TYPE == null || reqQuery.NUMBER == null) {
//         console.error("Validation Error: Do not Send Null In Any Parameter");
//         res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
//             {
//                 message: NAMES.VALIDATION_ERROR
//             }
//         );
//         return;
//     }
//     try {
//         let response = await this.stampsHandlerServices.UnblockStamps(reqQuery);
//         let responseData = {
//             status: true, 
//             message: "Success",
//             code: "200",
//             data: response
//         };
//         res.status(200).send({...responseData});
//     } catch (ex) {
//         console.error("stampsHandler - UnblockStamps || Error :", ex);
//         var cardError = constructCARDError(ex);
//         return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
//             {
//                 status: false,
//                 message: cardError.message
//             }
//         );
//     }
// }
VendorAvailableStampsCheckNew = async (req, res) => {
    const reqQuery = req.body;

    if (!reqQuery.FROM_OFFICE || !reqQuery.DENOMINATION || !reqQuery.STAMP_CODE ||
        !reqQuery.CATEGORY || !reqQuery.TYPE || !reqQuery.RECEIVED_DATE ||
        !reqQuery.SERIAL_NO_FROM_P || !reqQuery.SERIAL_NO_TO_P || 
        !reqQuery.SERIAL_NO_FROM || !reqQuery.SERIAL_NO_TO || 
        !reqQuery.TO_OFFICE || !reqQuery.SNO_MAIN || !reqQuery.STAMP_CODE) {

        console.error("Validation Error: Do not Send Null In Any Parameter");
        return res.status(400).send({ message: "Validation Error: Do not Send Null In Any Parameter" });
    }

    try {
        let response = await this.stampsHandlerServices.VendorAvailableStampsCheckNew(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send(responseData);
    } catch (ex) {
        console.error("stampsHandler - partialRevertBack || Error:", ex);

        if (ex.statusCode) {
            // Custom error with specific status code
            return res.status(ex.statusCode).send({
                status: false,
                message: ex.message
            });
        }

        // Default error handling
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
}
VendorRevertBack = async (req, res) => {
    const reqQuery = req.body;

    if (!reqQuery.FROM_OFFICE || !reqQuery.DENOMINATION || !reqQuery.STAMP_CODE ||
        !reqQuery.CATEGORY || !reqQuery.TYPE || !reqQuery.RECEIVED_DATE ||
        !reqQuery.SERIAL_NO_FROM_P || !reqQuery.SERIAL_NO_TO_P || 
        !reqQuery.SERIAL_NO_FROM || !reqQuery.SERIAL_NO_TO || 
        !reqQuery.TO_OFFICE || !reqQuery.SNO_MAIN || !reqQuery.STAMP_CODE) {

        console.error("Validation Error: Do not Send Null In Any Parameter");
        return res.status(400).send({ message: "Validation Error: Do not Send Null In Any Parameter" });
    }

    try {
        let response = await this.stampsHandlerServices.VendorRevertBack(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send(responseData);
    } catch (ex) {
        console.error("stampsHandler - partialRevertBack || Error:", ex);

        if (ex.statusCode) {
            // Custom error with specific status code
            return res.status(ex.statusCode).send({
                status: false,
                message: ex.message
            });
        }

        // Default error handling
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
}

partialRevertBack = async (req, res) => {
    const reqQuery = req.body;

    if (!reqQuery.FROM_OFFICE || !reqQuery.DENOMINATION || !reqQuery.STAMP_CODE ||
        !reqQuery.CATEGORY || !reqQuery.TYPE || !reqQuery.RECEIVED_DATE ||
        !reqQuery.SERIAL_NO_FROM_P || !reqQuery.SERIAL_NO_TO_P || 
        !reqQuery.SERIAL_NO_FROM || !reqQuery.SERIAL_NO_TO || 
        !reqQuery.TO_OFFICE || !reqQuery.SNO_MAIN || !reqQuery.STAMP_CODE) {

        console.error("Validation Error: Do not Send Null In Any Parameter");
        return res.status(400).send({ message: "Validation Error: Do not Send Null In Any Parameter" });
    }

    try {
        let response = await this.stampsHandlerServices.partialRevertBack(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send(responseData);
    } catch (ex) {
        console.error("stampsHandler - partialRevertBack || Error:", ex);

        if (ex.statusCode) {
            // Custom error with specific status code
            return res.status(ex.statusCode).send({
                status: false,
                message: ex.message
            });
        }

        // Default error handling
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
}
Checkdate = async (req, res) => {
    const reqQuery = req.query;
    try {
        let response = await this.stampsHandlerServices.Checkdate(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send(responseData);
    } catch (ex) {
        console.error("stampsHandler - partialRevertBack || Error:", ex);

        if (ex.statusCode) {
            // Custom error with specific status code
            return res.status(ex.statusCode).send({
                status: false,
                message: ex.message
            });
        }
        // Default error handling
        return res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
}

//---------------Internal Indents related--------------------------------------------------------------------------//

getBalanceNONSerilaStampsReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getBalanceNONSerilaStampsReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getBalanceNONSerilaStampsReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getFilledIndentRows = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.REQUEST_ID == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getFilledIndentRows(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getFilledIndentRows || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

insertInternalIndentDetails = async (req,res) => { 
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null||reqQuery.REQUEST_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.insertInternalIndentDetails(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - insertInternalIndentDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
submitIndent = async (req,res) => { 
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null||reqQuery.REQUEST_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.submitIndent(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - submitIndent || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

closeDistributedIndent = async (req,res) => { 
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null||reqQuery.REQUEST_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.closeDistributedIndent(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - submitIndent || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
deleteRow = async (req,res) => { 
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null || reqQuery.REQUEST_ID == null || reqQuery.ROWID == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.deleteRow(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - deleteRow || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
generateDocumentId = async (req, res) => {
    const reqBody = req.query.sr_code;
    try {
        let response = await this.stampsHandlerServices.generateDocumentId(reqBody);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("stampsHandler - generateDocumentId || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getDRcode = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getDRcode(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getDRcode || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getInternalSerialIndent = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getInternalSerialIndent(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getInternalSerialIndent || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getInternalNONSerialIndent = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getInternalNONSerialIndent(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getInternalSerialIndent || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


getPdfStampsPrint = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null || reqQuery.REQUEST_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getPdfStampsPrint(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - stampsprint || Error :", ex);
        if (ex.statusCode === 200) {
            return res.status(200).send({
                status: false,
                 message: ex.message
            });
    } else {
        let cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }

}
}

vendorCreation = async (req, res) => {
    const reqQuery = req.body;
    
    if (reqQuery.DR_CD == null || reqQuery.SR_CD == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR
        });
        return;
    }

    try {
        let response = await this.stampsHandlerServices.vendorCreation(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("stampsHandler - vendorCreation || Error :", ex);
        if (ex.statusCode === 203) {
            return res.status(203).send({
                status: false,
                 message: `${ex.venId}  Vendor ID already exist for this user`
            });
        } else {
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
                status: false,
                message: cardError.message
            });
        }
    }
}












//------RP------//

stamptypelisthndlr = async (req, res) => {
    const reqBody = req.query;
    try {
        let data = await this.stampsHandlerServices.stamptypelistsrvc(reqBody);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: data
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("masterHandler - stamptypelisthndlr || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
 
denominationslisthndl = async (req, res) => {
    const reqBody = req.query;
    try {
        let data = await this.stampsHandlerServices.denominationslistsrvc(reqBody);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: data
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("masterHandler - stamptypelisthndlr || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getstampavailablelisthndlr = async (req, res) => {
    const reqBody = req.query.sr_code;
    try {
        let data = await this.stampsHandlerServices.getstampavailablelistsrvc(reqBody);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: data
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("masterHandler - getstampavailablelisthndlr || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getVenderlistforaadharseed = async (req,res) => {  
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getVenderlistforaadharseed(reqQuery);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - getbalancestampsforwithOutserail || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
vendorAadharUpdate = async (req, res) => {
    const reqQuery = req.body;
   
    if (reqQuery.SR_CD == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR
        });
        return;
    }
 
    try {
        let response = await this.stampsHandlerServices.vendorAadharUpdate(reqQuery);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("stampsHandler - vendorCreation || Error :", ex);
        if (ex.statusCode === 203) {
            return res.status(203).send({
                status: false,
                 message: `Provided Aadhar Number already exist for this Vendor: ${ex.venId}`
            });
        } else {
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
                status: false,
                message: cardError.message
            });
        }
    }
}
 

getVerifyVENDERIndent = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getVerifyVENDERIndent(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getVerifyVENDERIndent || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
UpdateVendorIndentVerifyStatus = async (req,res) => {
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null||reqQuery.REQUEST_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.UpdateVendorIndentVerifyStatus(reqQuery);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - UpdateVendorIndentVerifyStatus || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getSrSaleUnderDrReport = async (req,res) => {  
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSrSaleUnderDrReport(reqQuery);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - getDRDistriReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSrSaleUnderNodalReport = async (req,res) => {   
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null|| reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.stampsHandlerServices.getSrSaleUnderNodalReport(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getSrSaleUnderNodalReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getSrSaleUnderDrReportPdf = async (req, res) => {
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.stampsHandlerServices.getSrSaleUnderDrReportPdf(reqQuery);
        res.status(200).send(
            {
                status: true,
                message: "Success",
                code: "200",
                data: response
            }
        );
    } catch (ex) {
        console.error("stampsHandler - getSrSaleUnderDrReportPdf || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getSrSaleUnderNodalReportPdf = async (req, res) => {
    const reqQuery = req.query;
    if (reqQuery.fromDate == null || reqQuery.toDate == null || reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.stampsHandlerServices.getSrSaleUnderNodalReportPdf(reqQuery);
        res.status(200).send(
            {
                status: true,
                message: "Success",
                code: "200",
                data: response
            }
        );
    } catch (ex) {
        console.error("stampsHandler - getSrSaleUnderNodalReportPdf || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
UpdateVendorIMainStatus = async (req,res) => {
    const reqQuery = req.body;
    if (reqQuery.FROM_OFFICE == null||reqQuery.REQUEST_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.UpdateVendorIMainStatus(reqQuery);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - UpdateVendorIMainStatus || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

//---------------------for vendor courtfee labels distri-----------------//


getIndentFormVENDERNonSerial = async (req,res) => { 
    const reqQuery = req.query;
    if (reqQuery.FROM_OFFICE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }  
    try{
        let response = await this.stampsHandlerServices.getIndentFormVENDERNonSerial(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getIndentFormVENDERNonSerial || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

NodalDistriwithoutSForVendor = async (req, res) => {
    const reqBody = req.body;
    if (reqBody.stamps == null || !Array.isArray(reqBody.stamps)) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.stampsHandlerServices.NodalDistriwithoutSForVendor(reqBody);;
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
        console.error("stampsHandler - NodalDistriwithoutSForVendor || Error :", ex);
        var cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getStampNamesnVendor = async (req,res) => {   
    try{
        let response = await this.stampsHandlerServices.getStampNamesnVendor();
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("stampsHandler - getStampNamesnVendor || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

//------------------START-----------------------------------ESIGN SKIP PROCESS API'S 3 IG LOGIN--------------------------------------------------//

getEsignSkipStatus = async (req,res) => {  
    try{
        let response = await this.stampsHandlerServices.getEsignSkipStatus();
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - getEsignSkipStatus || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
SkipOrEnableEsign = async (req,res) => {  
    try{
        let reqData = req.body;
        let response = await this.stampsHandlerServices.SkipOrEnableEsign(reqData);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - SkipOrEnableEsign || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getEsignSkipStatusDoc = async (req,res) => {  
    try{
        const reqData = req.body;
        let response = await this.stampsHandlerServices.getEsignSkipStatusDoc(reqData);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("stampsHandler - getEsignSkipStatusDoc || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
  //------------------END-----------------------------------ESIGN SKIP PROCESS API'S 3 IG LOGIN--------------------------------------------------//
 
 getDistStampReport = async (req,res) => {
        const reqData = req.query;
        if(!reqData.stampType){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        };
        try {
            let response = await this.stampsHandlerServices.getDistStampsData(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send(responseData);
        } catch (ex) {
            console.error("misHandler - getCRDAVillages|| Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    geSroStampReport = async (req,res) => {
        const reqData = req.query;
        
        if(!reqData.stampType){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        };
        try {
            let response = await this.stampsHandlerServices.getSroStampsData(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send(responseData);
        } catch (ex) {
            console.error("misHandler - getCRDAVillages|| Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    geStampReportSro = async (req,res) => {
        const reqData = req.query;
        
        if(!reqData.stampType){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        };
        try {
            let response = await this.stampsHandlerServices.getStampsSrData(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send(responseData);
        } catch (ex) {
            console.error("misHandler - getCRDAVillages|| Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

     getstampsstockDistReport = async (req, res) => {
        const reqData = req.body;
        try {
          let response =
            await this.stampsHandlerServices.getStampsDistDownload(reqData);
          let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response,
          };
          res.status(200).send({ ...responseData });
        } catch (ex) {
          console.error(
            "ReportHandler - getSelectedDocumentswisePDFf || Error :",
            ex
          );
          const cardError = constructCARDError(ex);
          return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
            status: false,
            message: cardError.message,
          });
        }
    };

    getStampsSROReport = async (req, res) => {
        const reqData = req.body;
        try {
          let response =
            await this.stampsHandlerServices.getStampsSrDownload(reqData);
          let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response,
          };
          res.status(200).send({ ...responseData });
        } catch (ex) {
          console.error(
            "ReportHandler - getSelectedDocumentswisePDFf || Error :",
            ex
          );
          const cardError = constructCARDError(ex);
          return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
            status: false,
            message: cardError.message,
          });
        }
    };

 
  

}
module.exports = stampsHandler;
