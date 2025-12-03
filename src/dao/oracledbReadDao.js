const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
oracleDb.autoCommit =true;
oracleDb.fetchAsBuffer=[oracleDb.BLOB];
const {doRelease,readDbConfig} = require('../plugins/database/oracleDbServices');

class OracleDao {
	oDBQueryService = async (query, bindValues) => {
		let conn;
		try{			
			conn = await oracleDb.getConnection(readDbConfig)
			let result = await conn.execute(query, bindValues, { outFormat: oracleDb.OBJECT });
			let resultList = result.rows;
			await doRelease(conn);
			conn = null;
			return resultList;
		}catch(ex){
			console.log("oracleCommonQueryService - oDBQueryService || Error : ", ex);
            throw new CARDError({err: ex.message});
		}finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	};


}
module.exports =  OracleDao;