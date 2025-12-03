const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');
const orDao = require('../dao/oracledbDao')
const { Logger } = require('../../services/winston');
class esignPendingServices {
	constructor(){
		this.obDao = new orDao();
	}
	getEsignPending = async (reqData) => {
        try {
            let query = `SELECT * FROM srouser.doc_ack where sr_code=${reqData.srCode} and reg_year=${reqData.regYear} and e_sign is null`;
            let response = await this.obDao.oDBQueryService(query);
			return response;
        } catch (ex) {
            Logger.error("PendingEsignHandler - getPendingEsign || Error :", ex);
            console.error("PendingEsignHandler - getPendingEsign || Error :", ex);
			throw constructCARDError(ex);
        }
    }
};


module.exports = esignPendingServices;