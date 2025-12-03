const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
oracleDb.autoCommit =true;
oracleDb.fetchAsBuffer=[oracleDb.BLOB];
const {doRelease,dbConfig,dbConfigCC,dbConfigSro,readDbConfig} = require('../plugins/database/oracleDbServices');
 
class OracleDao {
	oDBQueryServicemis = async (query, bindValues) => {
        let conn;
		try {
		  conn = await oracleDb.getConnection(dbConfig);
		  let result = await conn.execute(query, bindValues, { outFormat: oracleDb.OBJECT });
          let resultList = result.rows;
		  await doRelease(conn);
          conn = null;
		  return resultList;
		} catch (ex) {
		  console.log("oracleCommonQueryService - oDBQueryService || Error : ", ex);
		  throw ex;
		}finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	  };
	  oDBQueryService = async (query)=>{
        let conn;
		try{			
			conn = await oracleDb.getConnection(dbConfig)
			let result = await conn.execute(query,{},{outFormat: oracleDb.OBJECT});
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
    oDBQueryServiceread = async (query)=>{
        let conn;
		try{		
			conn = await oracleDb.getConnection(readDbConfig)
			let result = await conn.execute(query,{},{outFormat: oracleDb.OBJECT});
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
    
	oDBQueryServiceWithBindParams = async (query, bindParams)=>{
        console.log("OracleDao :: Inside of oDBQueryServiceWithBindParams method :::: ");
        let conn;
		try{			
			let conn = await oracleDb.getConnection(dbConfig)
			let result = await conn.execute(query, bindParams, {outFormat: oracleDb.OBJECT});
            let resultList = result.rows;
            await doRelease(conn);
            conn = null;
            console.log("OracleDao :: End of oDBQueryServiceWithBindParams method :::: ");
            return resultList;
		}catch(ex){
			console.log("oracleCommonQueryService - oDBQueryServiceWithBindParams || Error : ", ex);
            if (ex.message.includes("ORA-20008:")) {
                throw new CARDError({err: ex.message.split("ORA-20008:")[1].trim().split('.')[0] + '.'});
            }
            throw new CARDError({err: ex.message});
		}finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	};

	oDBQueryServiceCC = async(query) => {
        let conn;
		try{			
			conn = await oracleDb.getConnection(dbConfigCC)
			let result = await conn.execute(query,{},{outFormat: oracleDb.OBJECT});
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
    }
    oDBQueryServiceCCWithBindParams = async(query, bindParams) => {
        let conn;
		try{			
			conn = await oracleDb.getConnection(dbConfigCC)
			let result = await conn.execute(query,bindParams,{outFormat: oracleDb.OBJECT});
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
    }
 
    getSProcedureODB = async (query, obj)=>{
        let conn;
        try{
            conn = await oracleDb.getConnection(dbConfig);
            let result = await conn.execute(query,obj);
            let resultList = result.outBinds;
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oracleCommonQueryService - getSProcedureODB || Error : ", ex);
            throw new CARDError({err: (ex.message + ' ' + 'getSProcedureODB')});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    }
    getSProcedurereadODB = async (query, obj)=>{
        let conn;
        try{
            conn = await oracleDb.getConnection(readDbConfig);
            let result = await conn.execute(query,obj);
            let resultList = result.outBinds;
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oracleCommonQueryService - getSProcedureODB || Error : ", ex);
            throw new CARDError({err: (ex.message + ' ' + 'getSProcedureODB')});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    }
    oDbUpdate = async (query)=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig)
            let result = await conn.execute(query);
            let resultList = result.rowsAffected;
            console.log("Number of rows inserted:", resultList);
            await doRelease(conn);
            conn = null; 
            return resultList;
        }catch(ex){
            if (ex.message.includes("ORA-20008:")) {
                throw new CARDError({err: ex.message.split("ORA-20008:")[1].trim().split('.')[0] + '.'});
            }
            console.log("oracleCommonQueryService - oDbUpdate || Error : ", ex);
            throw new CARDError({err: ex.message});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
    oDbUpdateWithOutBreak = async (query)=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig)
            let result = await conn.execute(query);
            doRelease(conn);
            let resultList = result.rowsAffected;
            console.log("Number of rows updated:", resultList);
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oDbUpdateWithOutBreak - oDbUpdate || Error : ", ex);
            return ex;
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
    oDbDelete = async (query)=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig)
            let result = await conn.execute(query);
            let resultList = result.rowsAffected;
            console.log("Number of rows Deleted:", resultList);
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oracleCommonQueryService - oDbDelete || Error : ", ex);
            throw new CARDError({err: ex.message});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };

    oDbDeleteDocsWithBindParams = async (query, bindParams)=>{
        let conn;
		try{			
			let conn = await oracleDb.getConnection(dbConfig)
			let result = await conn.execute(query, bindParams);
			console.log("Number of rows deleted:", result.rowsAffected);
            let resultList = result.rowsAffected;
            await doRelease(conn);
            conn = null;
            return resultList;
		}catch(ex){
			console.log("oracleCommonQueryService - oDBQueryService || Error : ", ex);
            throw new CARDError({err: ( ex.message )});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	};
    
	oDbInsertDocsWithBindParams = async (query, bindParams)=>{
        let conn;
		try{			
			let conn = await oracleDb.getConnection(dbConfig)
			let result = await conn.execute(query, bindParams);
			console.log("Number of rows inserted:", result.rowsAffected);
            let resultList = result.rowsAffected;
            await doRelease(conn);
            conn = null;
            return resultList;
		}catch(ex){
			console.log("oracleCommonQueryService - oDBQueryService || Error : ", ex);
            throw new CARDError({err: ( ex.message )});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	};
 
    oDbInsertDocs = async (query, str="")=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig)
            let result = await conn.execute(query);
            console.log("Number of rows inserted:", result.rowsAffected);
            let resultList = result.rowsAffected;
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oracleCommonQueryService - oDBQueryService || Error : ", ex);
            throw new CARDError({err: ( ex.message + ' ' + str)});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
 
    oDbInsertMultipleDocs = async (queryArr, str="")=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig);
            let result = 0;
            for(let i of queryArr){
                let r = await conn.execute(i);
                result = result + r.rowsAffected;
            }
            await doRelease(conn);
            conn = null;
            console.log("Number of rows inserted:", result);
            return result;
        }catch(ex){
            console.log("oracleCommonQueryService - oDbInsertMultipleDocs || Error : ", ex);
            throw new CARDError({err: ( ex.message + ' ' + str)});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
 
    oDbInsertDocsWithOutBreak = async (query)=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig)
            let result = await conn.execute(query);
            let resultList = result.rowsAffected;
            console.log("Number of rows inserted:", resultList);
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oDbInsertDocsWithOutBreak - oDBQueryService || Error : ", ex);
            return ex;
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
    oDbInsertBlobDocs = async (query, bData, bData2 = '',bData3 = '')=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig);
            let setData = bData2 ? {blobData: { val: bData, type: oracleDb.BLOB }, blobData2: {val: bData2, type: oracleDb.BLOB}} : {blobData: { val: bData, type: oracleDb.BLOB }};
            if(bData3)
            setData.blobData3 = {val: bData3, type: oracleDb.BLOB};
            let result = await conn.execute(query,setData);
            let resultList = result.rowsAffected;
            console.log("Number of rows inserted:", resultList);
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oracleCommonQueryService - oDbInsertBlobDocs || Error : ", ex);
            throw new CARDError({err: ex.message});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
    oDbInsertBlobDocsWithBindParams = async (query, bindParam, bData, bData2 = '',bData3 = '')=>{
        let conn;
        try{            
            conn = await oracleDb.getConnection(dbConfig);
            let setData = bData2 ? {blobData: { val: bData, type: oracleDb.BLOB }, blobData2: {val: bData2, type: oracleDb.BLOB}} : {blobData: { val: bData, type: oracleDb.BLOB }};
            if(bData3)
            setData.blobData3 = {val: bData3, type: oracleDb.BLOB};
            let valueParams = {...bindParam, ...setData}
            let result = await conn.execute(query,valueParams);
            let resultList = result.rowsAffected;
            console.log("Number of rows inserted:", resultList);
            await doRelease(conn);
            conn = null;
            return resultList;
        }catch(ex){
            console.log("oracleCommonQueryService - oDbInsertBlobDocsWithBindParams || Error : ", ex);
            throw new CARDError({err: ex.message});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
    };
    oDBQueryServicereadWithBindParamsed = async (query, bindParams)=>{
        console.log("OracleDao :: Inside of oDBQueryServiceWithBindParams method :::: ");
        let conn;
		try{			
			let conn = await oracleDb.getConnection(dbConfig)
			let result = await conn.execute(query, bindParams, {outFormat: oracleDb.OBJECT});
            let resultList = result.rows;
            await doRelease(conn);
            conn = null;
            console.log("OracleDao :: End of oDBQueryServiceWithBindParams method :::: ");
            return resultList;
		}catch(ex){
			console.log("oracleCommonQueryService - oDBQueryServiceWithBindParams || Error : ", ex);
            throw new CARDError({err: ex.message});
		}finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	};

  oDbInsertDocsWithBindParamsSR1 = async (query, bindParams)=>{
        let conn;
		try{			
			let conn = await oracleDb.getConnection(dbConfigSro)
			let result = await conn.execute(query, bindParams);
			console.log("Number of rows inserted:", result.rowsAffected);
            let resultList = result.rowsAffected;
            await doRelease(conn);
            conn = null;
            return resultList;
		}catch(ex){
			console.log("oracleCommonQueryService - oDBQueryService || Error : ", ex);
            throw new CARDError({err: ( ex.message )});
        }finally{
			if(conn!=undefined && conn!=null)
				await doRelease(conn);
		}
	};

  oDbInsertDocsWithBindParamsSR = async (queries) => {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfigSro)    
            const results = [];
            for (const { query, bindParams } of queries) {
                const result = await conn.execute(query, bindParams,{ autoCommit: false });
                console.log("Query executed, rows affected:", result.rowsAffected);
                results.push(result.rowsAffected);
            }
            await conn.commit(); 
            console.log("Transaction committed successfully.");
            return results;
        } catch (ex) {            
            if (conn) {
                await conn.rollback();
                console.error("Transaction rolled back due to error:", ex);
            }
            throw new CARDError({ err: ex.message });
        } finally {
            if (conn) {
                await doRelease(conn); 
            }
        }
    };

    oDbMultipleInsertDocsWithBindParams = async (queries) => {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfig)    
            const results = [];
            for (const { query, bindParams } of queries) {
                const result = await conn.execute(query, bindParams,{ autoCommit: false });
                console.log("Query executed, rows affected:", result.rowsAffected);
                results.push(result.rowsAffected);
            }
            await conn.commit();
            console.log("Transaction committed successfully.");
            return results;
        } catch (ex) {            
            if (conn) {
                await conn.rollback();
                console.error("Transaction rolled back due to error:", ex);
            }
            throw new CARDError({ err: ex.message });
        } finally {
            if (conn) {
                await doRelease(conn);
            }
        }
    };
}
module.exports =  OracleDao;