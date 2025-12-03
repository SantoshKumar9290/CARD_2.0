
const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const axios = require('axios');
const https = require('https');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

class StockHoldingService {
	constructor() {
		this.orDao = new OrDao();
	}

	slotUpdateSrvc = async (reqData, loginUser) => {
		try {
			let authStatus = reqData.AUTH_STATUS;
			let sroCode = loginUser.SRO_CODE;
			let status = 'BOOKED';
			if(authStatus=="Y")
				status="VERIFIED";
			// let query = `select * from preregistration.slot_details where AUTH_STATUS = 'Y'`;
			let query = `update preregistration.slot_details set AUTH_STATUS = '${authStatus}', status = '${status}' where id = '${reqData.id}' and sr_code = '${sroCode}'`;
			console.log(":::::::::::::::::::query",query)
			let response = await this.orDao.oDbUpdate(query);
			console.log(":::::::::::::::::::response",response)
			if(response>0){
				let apiData = {"applicationId":reqData.id, "status":status, "sroOfcNum":sroCode};
				console.log(":::::::::::::::::::apiData",apiData)
				const headers = {
					'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
					'Content-Type': 'application/json'
				};  
				let slotStatusResponse = await instance({ method: "POST", url: `${process.env.PDE_HOST}/pdeapi/v1/slots/statusUpdate`, headers: headers, data:apiData });
				console.log(":::::::::::::::::::slotStatusResponse",slotStatusResponse)
				console.log("slotStatusResponse ::::::: ",slotStatusResponse);
			}
			return response;
		} catch (ex) {
			Logger.error("slotUpdateSrvc - slotUpdateSrvc || Error :", ex);
			console.error("slotUpdateSrvc - slotUpdateSrvc || Error :", ex);
			throw new CARDError(ex);
		}
	}
}

module.exports = StockHoldingService;