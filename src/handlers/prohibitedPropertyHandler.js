const ProhibitedPropertyServices= require('../services/prohibitedPropertyServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const OrServices = require('../services/prohibitedPropertyServices')
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class ProhibitedPropertyHandler {
	constructor(){
        this.OrServices = new OrServices();
        this.prohibitedPropertyServices = new ProhibitedPropertyServices();
    };

    
	getListVillagesR = async(req,res) => {
		const reqQuery = req.query;
		if(reqQuery?.srCode == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
            let response = await this.prohibitedPropertyServices.getListVillagesRSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListVillagesR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
    getListVillagesU = async(req,res) => {
		const reqQuery = req.query;
		if(reqQuery?.srCode == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
            let response = await this.prohibitedPropertyServices.getListVillagesUSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListVillagesU || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    getListofRoles = async(req,res) => {
		try{
            let response = await this.prohibitedPropertyServices.getListofRolesSrvc();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListofRoles || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    getPPCodes = async(req,res) => {
		
		try{
            let response = await this.prohibitedPropertyServices.getPPCodeSrvc();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getPPCodes || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
    getPPSections = async(req,res) => {
		
		try{
            let response = await this.prohibitedPropertyServices.getPPSectionSrvc();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getPPCodes || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
    getDenotifyVillage = async(req,res) => {
		const reqQuery = req.query;
        const reqParams = req.params;
		if(reqQuery?.srCode == null || reqQuery?.villageCode == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
            let response = await this.prohibitedPropertyServices.getDenotifySrvc(reqQuery,reqParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "Data Not Found",
                    code: "404"
                })
                return;
            }
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getDenotifyVillageU || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    
    saveVillageHandler = async(req,res) => {
        const reqBody = req.body;
        const reqParams= req.params; 
        console.log(reqParams,'type');
		try{
			let response = await this.OrServices.saveNotifySrvc(reqBody,reqParams);
            res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    response
                }
            );
		}catch(ex){
            console.error("ProhibitedPropertyHandler - saveVillageHandler || Error :", ex);
            if (ex.statusCode === 200) {
                return res.status(200).send({
                    status: false,
                     message: `Property already notified.`
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
saveDenotifyVillage = async(req,res) => {
    const reqQuery = req.body;
    const reqParams= req.params;
    try{
        let response = await this.OrServices.saveDenotifySrvc(reqQuery,reqParams);
        res.status(200).send(
            {
                status:true, 
                message: "Success",
                code: "200",
                response
            }
        );
    }catch(ex){
        console.error("ProhibitedPropertyHandler - saveDenotifyVillage || Error :", ex);
        let cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

PPpendingEsignList = async(req,res)=>{
    const reqBody = req.body;
    try {
      let response = await this.OrServices.PPpendingEsignList(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("ProhibitedpropertyHandler - pending esign || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }


PPDenotifypendingEsignList = async(req,res)=>{
    const reqBody = req.body;
    try {
      let response = await this.OrServices.PPDenotifypendingEsignListSrvc(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("ProhibitedpropertyHandler - PPDenotifypendingEsignList || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }

	// Market value revision related
	getListVillagesMakeEffectiveReqR= async(req,res) => {
		const reqQuery = req.query;
		if(reqQuery?.srCode == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
            let response = await this.prohibitedPropertyServices.getListVillagesMakeEffectiveReqR(reqQuery);
			res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListVillagesMakeEffectiveReqR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
    getListVillagesMakeEffectiveReqU= async(req,res) => {
		const reqQuery = req.query;
		if(reqQuery?.srCode == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
            let response = await this.prohibitedPropertyServices.getListVillagesMakeEffectiveReqU(reqQuery);
			res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListVillagesMakeEffectiveReqU || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 



    getListVillagesRDRAC = async(req,res) => {
		const reqQuery = req.query;
		if(reqQuery?.srCode == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    console.log('sddf');
		try{
            let response = await this.prohibitedPropertyServices.getListVillagesRDRACSrvc(reqQuery);
			res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListVillagesRDRAC || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
    getListVillagesUDRAC = async(req,res) => {
		const reqQuery = req.query;
		if(reqQuery?.srCode == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
            let response = await this.prohibitedPropertyServices.getListVillagesUDRACSrvc(reqQuery);
			res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("ProhibitedPropertyHandler - getListVillagesUDRAC || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

    getNotifyDetails = async(req,res) => {
        const reqBody = req.query;
        const reqParams= req.params;  
		try{
			let response = await this.OrServices.getNotifyDetailsSrvc(reqBody,reqParams);
            res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data : response
                }
            );
		}catch(ex){
			console.error("ProhibitedPropertyHandler - getNotifyDetails || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}

    }


	updateVillageHandler = async(req,res) => {
        const reqBody = req.body;
        const reqParams= req.params;  
        try{
            let response = await this.OrServices.updateNotifySrvc(reqBody,reqParams);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    response
                }
            );
        }catch(ex){
            console.error("ProhibitedPropertyHandler - saveVillageHandler || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
 
    }


	getExtentNotifyDetails = async(req,res) => {
        const reqBody = req.query;
        const reqParams= req.params;  
        try{
            let response = await this.OrServices.getExtentNotifyDetailsSrvc(reqBody,reqParams);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data : response
                }
            );
        }catch(ex){
            console.error("ProhibitedPropertyHandler - getNotifyDetails || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
 
    }


	updateExtentVillageHandler = async(req,res) => {
        const reqBody = req.body;
        const reqParams= req.params;  
        try{
            let response = await this.OrServices.updateExtentNotifySrvc(reqBody,reqParams);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    response
                }
            );
        }catch(ex){
            console.error("ProhibitedPropertyHandler - updateExtentVillageHandler || Error :", ex);
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
module.exports = ProhibitedPropertyHandler;





