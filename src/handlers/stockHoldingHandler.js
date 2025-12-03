const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("./errorHandler");
const StockHoldingService = require('../services/stockHoldingService')
const axios = require('axios').default;
const Unirest = require('unirest');
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase,hashGenerate} = require('../utils/index');
const QRCode = require('qrcode');

// const http = require('h')
class StockHoldingHandler {
	constructor() {
		this.stockHoldingSrvc = new StockHoldingService();
	}
	eRegRecieptVerify = async (req, res) => {
		const reqQuery = req.query;
		let uReqId = new Date().valueOf();
		try {
			let signeture = await hashKey(String(uReqId));
			const headers = {
				'x-shcil-req-id': String(uReqId),
				'x-shcil-signature': signeture,
				'Content-Type': 'application/json'
			};
			const url = `${process.env.STOCKHOLDING_API}/Registration/japi/verifyRegRcpt`
			const data = JSON.stringify({ "stateCd": "AP", "rcptNo": reqQuery.recptNo })
			let loginResponse = await axios({ method: "POST", data: data, url: url, headers: headers, timeout: 0 })
			// res.send(loginResponse.data)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: loginResponse.data
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		} catch (ex) {
			return res.status(500).send({
				status: false,
				message: ex,
			})
		}
	}
	eRegReceiptLock = async (req,res)=>{
		const reqBody = req.body;
		let uReqId = new Date().valueOf();
		try {
			let signeture = await lockHashKey(String(uReqId));
			const headers = {
				'x-shcil-req-id': String(uReqId),
				'x-shcil-signature': signeture,
				'Content-Type': 'application/json'
			};
			const url = `${process.env.STOCKHOLDING_API}/Registration/japi/lockRegRcpt`
			const data = JSON.stringify({"methodName":"lockRcptRequest","stateCd":"AP","rcptNo":`${reqBody.recptNo}`,"rcptAmt":`${reqBody.amount}`,"shclUsrId":`${process.env.SHCIL_USER_ID}`,"lockByUser":"apvijwadws1","lockRefNo":`${reqBody.recptNo}`})
			let loginResponse = await axios({ method: "POST", data: data, url: url, headers: headers, timeout: 0 })
			// res.send(loginResponse.data)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: loginResponse.data
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		} catch (ex) {
			return res.status(500).send({
				status: false,
				message: ex,
			})
		}
	}

	qrCodeGenerate = async (req,res)=>{
		const reqBody = req.body;
		
console.log("::::::::::",reqBody)
		if( reqBody.sroCode == null){

			return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				});
		}
		try{
			const today = new Date();
			const yyyy = today.getFullYear();
			let mm = today.getMonth() + 1; // Months start at 0!
			let dd = today.getDate();

			if (dd < 10) dd = '0' + dd;
			if (mm < 10) mm = '0' + mm;

			const formattedToday = dd + '/' + mm + '/' + yyyy;
			// let hash = encryptWithAESPassPhrase(reqBody.sroCode+","+`${formattedToday}`, "123456");
 			
			// let hash =await hashGenerate(reqBody.sroCode+","+`${formattedToday}`)
			// hash = encodeURIComponent(hash);
			// const url = `http://localhost:5003/SB/QrSlot/${hash}`;
			// const qrCodeImage = await QRCode.toDataURL(url);
			// res.send(`${qrCodeImage}`);

			let hash =await hashGenerate(String(reqBody.sroCode));
			console.log("::::::::::::::::::::",hash)
			const url = process.env.SLOT_BOOKING_URL + `/${hash}`;
			console.log("::::::::::::::::::::",url)
			const qrCodeImage = await QRCode.toDataURL(url);
			res.send({data:`${qrCodeImage}`, url:url});

		}catch(ex){
			console.error("StockHoldingHandler - qrCodeGenerate || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	slotStatusUpdatte = async (req, res) => {
        const reqBody = req.body;
		const loginUser = req.user;
        try {
            let result = await this.stockHoldingSrvc.slotUpdateSrvc(reqBody, loginUser);
            let responseData ={
                status: true,
                message: "Success",
                code: "200",
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
            return result;
        } catch (ex) {
            console.error("StockHoldingHandler - slotStatusUpdatte || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


	frankinLogin = async (req, res) => {
		let authToken = null;
		try {
			const headers = {
				'Content-Type': 'application/json'
			};
			 //console.log("2222222222222222222222222",headers)
			const url = `${process.env.FRANKLIN_URL}/pbfundsRestService/generateAPToken`;
			 //console.log("333333333333",url)
			const data = JSON.stringify({
				methodName: "franklin",
				username: process.env.FRANKLIN_USERNAME,
				password: process.env.FRANKLIN_PASSWORD
			});
			// console.log("44444444444444444",data)
			let result = await axios({ method: "POST", data: data, url: url, headers: headers, timeout: 0 });	
			 //console.log("5555555555555555555555", result);
			authToken = result.data?.jwt || result.data?.token || result.data?.accessToken || null; 
			 //console.log("666666666666666666666666", authToken);			
		} catch (ex) {
			console.error("StockHoldingHandler - frankinLogin || Error:", ex);
		}
		return authToken;
	};
		
	
	getVendorDetails = async (req, res) => {
		const reqBody = req.body;
		 //console.log("88888888888", reqBody);	
		try {
			let authToken = await this.frankinLogin();			
			 console.log("Using token:", authToken);	
			if (!authToken) {
				return res.status(401).send({ status: false, message: "Authorization token missing" });
			}	
			const headers = {
				'Authorization': `Bearer ${authToken}`,
				'Content-Type': 'application/json'
			};
			// console.log("10000000000000", headers);	
			const url = `${process.env.FRANKLIN_URL}/pbfundsRestService/getVendorDetails`;
			const data = JSON.stringify({
				methodName: "Vendors",
				ddoCodeList: reqBody.ddoCodeList
			});
			// console.log("99999999999999", data);
			let result = await axios({ method: "POST", data: data, url: url, headers: headers, timeout: 0 });
			 console.log("!!!!!!!!!!!!!!!!!!!!1", result);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: result.data.responseBody
			};	
			res.status(200).send({ ...responseData });
			 //console.log("@@@@@@@@@@@@@@@@@@222222", responseData);
		} catch (ex) {
			console.error("StockHoldingHandler - getVendorDetails || Error:", ex);			
		}
	};
		
	createFundFile = async (req,res) => {
		const reqBody = req.body;
		try {
			let authToken = await this.frankinLogin();
			 console.log("Using token:", authToken);	
			if (!authToken) {
				return res.status(401).send({ status: false, message: "Authorization token missing" });
			}	
			const headers = {
				'Authorization': `Bearer ${authToken}`, 
				'Content-Type': 'application/json'
			};
			 //console.log("10000000000000", headers);
			const url = `${process.env.FRANKLIN_URL}/pbfundsRestService/createAPFundFiles`
			const data = JSON.stringify({"methodName":"Vendors","meterNo": reqBody.meterNo, "licenseNo": reqBody.licenseNo,
				"challanNo": reqBody.challanNo,"challanAmount": reqBody.challanAmount, "amountCredit": reqBody.amountCredit,
				"commissionPercentage": reqBody.commissionPercentage, "challanDate": reqBody.challanDate, "emailId": reqBody.emailId,
				"remarks": reqBody.remarks, "sharedSecret": '_pbbq_'});
			let loginResponse = await axios({ method: "POST", data: data, url: url, headers: headers, timeout: 0 })
			// console.log("##########################",loginResponse)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: loginResponse.data,
				reason :  loginResponse.data.responseMessage
			};
			res.status(200).send({...responseData});				
		} catch (ex) {
			console.error("StockHoldingHandler - createFundFile || Error :", ex);
			if (ex.response && ex.response.data) {
				const { responseCode, responseMessage } = ex.response.data;
				if (responseCode === '04') {
					return res.status(406).send({
						status: false,
						data: ex.response.data.responseMessage
					});
				}
			}
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name] || 500).send({
				status: false,
				message: cardError.message
			});
		}
	}

}

const crypto = require('crypto');
async function hashKey(data) {
	return crypto.createHmac('sha256', process.env.HASH_KEY_SECRET).update(data).digest('hex');
}
async function lockHashKey(data) {
	return crypto.createHmac('sha256', process.env.HASH_KEY_SECRET).update(data).digest('hex');
}

module.exports = StockHoldingHandler;