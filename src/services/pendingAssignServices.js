const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');

class PendingAssignServices {

	getPendingAssign = async (query)=>{
		try{			
			let conn = await oracleDb.getConnection(dbConfig)
			let result = await conn.execute(query,{},{outFormat: oracleDb.OBJECT});
			doRelease(conn);
			return result.rows;
		}catch(ex){
			console.log("PendingAssignServices - getPendingAssign || Error : ", ex);
            throw new CARDError({err: ex});
		}
	}

};


module.exports = PendingAssignServices;