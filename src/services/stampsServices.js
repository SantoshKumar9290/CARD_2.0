const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const puppeteer = require('puppeteer');
const path = require("path");
const fsone = require("fs");
const fs = require("fs").promises;
const OrDaoRead = require('../dao/oracledbReadDao');
const { generatePDFFromHTML } = require("./generatePDFFromHTML");





class stampsService {
    constructor() {
        this.orDao = new OrDao();
        this.orDaoRead = new OrDaoRead();
    }
    getStampNames = async () => {
        try {
            let query = `select distinct name,code,old_code,category,type from stamp_name where serial_no='Y' order by name`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getStampNames || Error :", ex);
            console.error("stampsServices - getStampNames || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getStampForIndent = async () => {
        try {
            let query = `select distinct name,code,old_code,category,type from stamp_name order by name`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getStampForIndent || Error :", ex);
            console.error("stampsServices - getStampForIndent || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getStampNamesn = async () => {
        try {
            let query = `select distinct name,code,old_code,category,type from stamp_name where serial_no='N' AND CODE NOT IN '14' order by name`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getStampNames || Error :", ex);
            console.error("stampsServices - getStampNames || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getstampCatTypeDeno = async (reqData) => {
        try {
            let query = ` select distinct CATEGORY,TYPE from stamp_name WHERE CODE='${reqData.CODE}'`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getstampCatTypeDeno || Error :", ex);
            console.error("stampsServices - getstampCatTypeDeno || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getstampDeno = async (reqData) => {
        try {
            let query = ` select DENOMINATION from stamp_name where CODE='${reqData.CODE}'`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getstampDeno || Error :", ex);
            console.error("stampsServices - getstampDeno || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    nodalEntryRegisterEntryWithS = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.stamps; 
			for (let i = 0; i < arrayData.length; i++) {
				let query = ` insert into main_stock_reg_sno (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, TIME_STAMP, SNO_MAIN, STAMP_CODE) values
                 (
                TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
                 '${arrayData[i].RECEIVED_BY}',
				'${arrayData[i].CATEGORY}',
				'${arrayData[i].TYPE}',			
				'${arrayData[i].DENOMINATION}',
				'${arrayData[i].BUNDLE_NO}',
				'${arrayData[i].SERIAL_NO_FROM}',
                '${arrayData[i].SERIAL_NO_TO}',
                 sysdate,
                '${arrayData[i].SNO_MAIN}',
				'${arrayData[i].STAMP_CODE}'
				)`;
				responseArray.push(query);
	
			}
			response = await this.orDao.oDbInsertMultipleDocs(responseArray,'Nodal Entry register with serialno');
			return response;
		} catch (ex) {
            Logger.error("stampsServices - NodalEntryRegisterEntrywithSerialNo || Error :", ex);
			console.error("stampsServices - NodalEntryRegisterEntrywithSerialNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}
    nodalEntryRegisterEntryWithoutS = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.stamps; 
			for (let i = 0; i < arrayData.length; i++) {
				let query = `insert into main_stock_reg (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, SERIAL_NO_TO, TIME_STAMP, STAMP_CODE) values 
                (TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
                 '${arrayData[i].RECEIVED_BY}',
				'${arrayData[i].CATEGORY}',
				'${arrayData[i].TYPE}',			
				'${arrayData[i].DENOMINATION}',
				'${arrayData[i].SERIAL_NO_TO}',
                 sysdate,
				'${arrayData[i].STAMP_CODE}'
				)`;
				responseArray.push(query);
	
			}
			response = await this.orDao.oDbInsertMultipleDocs(responseArray,'Nodal Entry register without serialno');
			return response;
		} catch (ex) {
            Logger.error("stampsServices - NodalEntryRegisterEntrywithoutSerialNo || Error :", ex);
			console.error("stampsServices - NodalEntryRegisterEntrywithoutSerialNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}
    // NodalDistriwithS = async (reqData) => {
	// 	try {
	// 		let response;
	// 		let responseArray = [];
	// 		let arrayData = reqData.stamps; 
	// 		for (let i = 0; i < arrayData.length; i++) {
	// 			let query = `INSERT INTO dist_stock_reg_sno (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, SNO_MAIN,STAMP_CODE, SERIAL_NO) values 
    //             (TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
    //             '${arrayData[i].RECEIVED_BY}',
	// 			'${arrayData[i].CATEGORY}',
	// 			'${arrayData[i].TYPE}',			
	// 			'${arrayData[i].DENOMINATION}',
	// 			'${arrayData[i].BUNDLE_NO}',
	// 			'${arrayData[i].SERIAL_NO_FROM}',
    //             '${arrayData[i].SERIAL_NO_TO}',
    //             '${arrayData[i].DELIVERED_BY}',
    //              LPAD('${arrayData[i].TO_OFFICE}', 4, '0'),
    //              LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
    //              sysdate,
    //             '${arrayData[i].SNO_MAIN}',
    //             '${arrayData[i].STAMP_CODE}',
    //             '')`;
	// 			responseArray.push(query);
    //             console.log(query);
	// 		}
	// 		response = await this.orDao.oDbInsertMultipleDocs(responseArray,'Nodal Entry register with serialno');
	// 		return response;
	// 	} catch (ex) {
    //         Logger.error("stampsServices - NodalStampsDistrbutioniwithSerialNo || Error :", ex);
	// 		console.error("stampsServices - NodalStampsDistrbutioniwithSerialNo || Error :", ex);
	// 		throw constructCARDError(ex);
	// 	}
	// }

    // NodalDistriwithS = async (reqData) => {
    //     try {
    //         let response;
    //         let responseArray = [];
    //         let arrayData = reqData.stamps;
    
    //         // First insertion
    //         for (let i = 0; i < arrayData.length; i++) {
    //             let query = `INSERT INTO dist_stock_reg_sno (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, SNO_MAIN, STAMP_CODE, SERIAL_NO) values 
    //                 (TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
    //                 '${arrayData[i].RECEIVED_BY}',
    //                 '${arrayData[i].CATEGORY}',
    //                 '${arrayData[i].TYPE}',            
    //                 '${arrayData[i].DENOMINATION}',
    //                 '${arrayData[i].BUNDLE_NO}',
    //                 '${arrayData[i].SERIAL_NO_FROM}',
    //                 '${arrayData[i].SERIAL_NO_TO}',
    //                 '${arrayData[i].DELIVERED_BY}',
    //                 LPAD('${arrayData[i].TO_OFFICE}', 4, '0'),
    //                 LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
    //                 sysdate,
    //                 '${arrayData[i].SNO_MAIN}',
    //                 '${arrayData[i].STAMP_CODE}',
    //                 '')`;
    //             responseArray.push(query);
    //         }
    //         response = await this.orDao.oDbInsertMultipleDocs(responseArray, 'Nodal Entry register with serialno');
    
    //         // Insert serial numbers using PL/SQL block
    //         for (let i = 0; i < arrayData.length; i++) {
    //             const {  CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, TO_OFFICE, FROM_OFFICE, SNO_MAIN, STAMP_CODE } = arrayData[i];
    //             const serialStart = parseInt(SERIAL_NO_FROM, 10);
    //             const serialEnd = parseInt(SERIAL_NO_TO, 10);
    
    //             const sql = `
    //                 BEGIN
    //                     FOR i IN :start..:end LOOP
    //                         INSERT INTO stamp_manager (SR_CODE,DENOMINATION,BUNDLE_NO, CATEGORY,TYPE,SNO_MAIN,SERIAL_NO,TIME_STAMP) 
    //                         VALUES (TO_DATE(:receivedDate, 'DD-MM-YYYY'),
    //                                 LPAD(:srcode, 4, '0'),
    //                                 :denomination
    //                                 :bundleNo
    //                                 :category,
    //                                 :type,            
    //                                 :snoMain,
    //                                 sysdate,
    //                                 i);
    //                     END LOOP;
    //                 END;
    //             `;
    
    //             const binds = {
    //                 start: serialStart,
    //                 end: serialEnd,
    //                 category: CATEGORY,
    //                 type: TYPE,
    //                 denomination: DENOMINATION,
    //                 bundleNo: BUNDLE_NO,
    //                 srcode: TO_OFFICE,
    //                 snoMain: SNO_MAIN,
    //             };
    
    //             await this.orDao.oDbExecute(sql, binds, { autoCommit: true });
    //         }
    
    //         return response;
    //     } catch (ex) {
    //         Logger.error("stampsServices - NodalStampsDistrbutioniwithSerialNo || Error :", ex);
    //         console.error("stampsServices - NodalStampsDistrbutioniwithSerialNo || Error :", ex);
    //         throw constructCARDError(ex);
    //     }
    // }
    
    // NodalDistriwithS = async (reqData) => {
    //     try {
    //         let response;
    //         let responseArray = [];
    //         let arrayData = reqData.stamps;
    
    //         // First insertion
    //         for (let i = 0; i < arrayData.length; i++) {
    //             let query = `INSERT INTO dist_stock_reg_sno (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, SNO_MAIN, STAMP_CODE, SERIAL_NO) values 
    //                 (TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
    //                 '${arrayData[i].RECEIVED_BY}',
    //                 '${arrayData[i].CATEGORY}',
    //                 '${arrayData[i].TYPE}',            
    //                 '${arrayData[i].DENOMINATION}',
    //                 '${arrayData[i].BUNDLE_NO}',
    //                 '${arrayData[i].SERIAL_NO_FROM}',
    //                 '${arrayData[i].SERIAL_NO_TO}',
    //                 '${arrayData[i].DELIVERED_BY}',
    //                 LPAD('${arrayData[i].TO_OFFICE}', 4, '0'),
    //                 LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
    //                 sysdate,
    //                 '${arrayData[i].SNO_MAIN}',
    //                 '${arrayData[i].STAMP_CODE}',
    //                 '')`;
    //             responseArray.push(query);
    //         }
    
    //         response = await this.orDao.oDbInsertMultipleDocs(responseArray, 'Nodal Entry register with serialno');
    
    //         if (response.success) {
    //             // Delete query
    //             const deleteQuery = `DELETE FROM STAMP_MANAGER 
    //                                  WHERE DENOMINATION = '${arrayData[i].DENOMINATION}' 
    //                                  AND BUNDLE_NO = '${arrayData[i].BUNDLE_NO}'
    //                                  AND CATEGORY =  '${arrayData[i].CATEGORY}'
    //                                  AND SNO_MAIN =  '${arrayData[i].SNO_MAIN}'
    //                                  AND SR_CODE =   LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
    //                                  AND SERIAL_NO BETWEEN  '${arrayData[i].SERIAL_NO_FROM}' AND  '${arrayData[i].SERIAL_NO_TO}'`;
    
    //             const deleteResponse = await this.orDao.oDbExecute(deleteQuery, [], { autoCommit: true });
    
    //             if (deleteResponse.success) {
    //                 // Insert serial numbers using PL/SQL block
    //                 for (let i = 0; i < arrayData.length; i++) {
    //                     const { CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, TO_OFFICE, FROM_OFFICE, SNO_MAIN, STAMP_CODE } = arrayData[i];
    //                     const serialStart = parseInt(SERIAL_NO_FROM, 10);
    //                     const serialEnd = parseInt(SERIAL_NO_TO, 10);
    
    //                     const sql = `
    //                         BEGIN
    //                             FOR i IN :start..:end LOOP
    //                                 INSERT INTO stamp_manager (SR_CODE, DENOMINATION, BUNDLE_NO, CATEGORY, TYPE, SNO_MAIN, SERIAL_NO, TIME_STAMP) 
    //                                 VALUES (:srCode, :denomination, :bundleNo, :category, :type, :snoMain, i, sysdate);
    //                             END LOOP;
    //                         END;
    //                     `;
    
    //                     const binds = {
    //                         start: serialStart,
    //                         end: serialEnd,
    //                         srCode: TO_OFFICE,
    //                         denomination: DENOMINATION,
    //                         bundleNo: BUNDLE_NO,
    //                         category: CATEGORY,
    //                         type: TYPE,
    //                         snoMain: SNO_MAIN
    //                     };
    
    //                     const insertResponse = await this.orDao.oDbExecute(sql, binds, { autoCommit: true });
    
    //                     if (!insertResponse.success) {
    //                         throw new Error(`Failed to insert serial numbers for ${TO_OFFICE}, ${DENOMINATION}, ${BUNDLE_NO}`);
    //                     }
    //                 }
    //             } else {
    //                 throw new Error('Failed to delete records from STAMP_MANAGER');
    //             }
    //         } else {
    //             throw new Error('Failed to insert records into dist_stock_reg_sno');
    //         }
    
    //         return response;
    //     } catch (ex) {
    //         Logger.error("stampsServices - NodalStampsDistrbutioniwithSerialNo || Error :", ex);
    //         console.error("stampsServices - NodalStampsDistrbutioniwithSerialNo || Error :", ex);
    //         throw constructCARDError(ex);
    //     }
    // }
    NodalDistriwithS = async (reqData) => {
        try {
            let response;
            let responseArray = [];
            let arrayData = reqData.stamps;
    
            // Prepare and execute insertion queries
            for (let i = 0; i < arrayData.length; i++) {
                let query = `
                    INSERT INTO dist_stock_reg_sno (
                        RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, 
                        DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, SNO_MAIN, STAMP_CODE, SERIAL_NO,INDENT_NO
                    ) VALUES (
                        TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
                        SUBSTR('${arrayData[i].RECEIVED_BY}', 1, 30),
                        '${arrayData[i].CATEGORY}',
                        '${arrayData[i].TYPE}',            
                        '${arrayData[i].DENOMINATION}',
                        '${arrayData[i].BUNDLE_NO}',
                        '${arrayData[i].SERIAL_NO_FROM}',
                        '${arrayData[i].SERIAL_NO_TO}',
                        '${arrayData[i].DELIVERED_BY}',
                        CASE 
    WHEN LENGTH('${arrayData[i].TO_OFFICE}') < 4 THEN LPAD('${arrayData[i].TO_OFFICE}', 4, '0')
    ELSE '${arrayData[i].TO_OFFICE}'
END,
                        LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
                        SYSDATE,
                        '${arrayData[i].SNO_MAIN}',
                        '${arrayData[i].STAMP_CODE}',
                        '',
                         NVL('${arrayData[i].INDENT_NO}', '')
                    )
                `;
                responseArray.push(query);
            }
    
            response = await this.orDao.oDbInsertMultipleDocs(responseArray, 'Nodal Entry register with serialno');
            console.log('Insertion Response:', response);
    
                if (response >= 1) {
                    // Delete records
                    for (let i = 0; i < arrayData.length; i++) {
                        const deleteQuery = `
                            DELETE FROM STAMP_MANAGER 
                            WHERE DENOMINATION = '${arrayData[i].DENOMINATION}' 
                            AND BUNDLE_NO = '${arrayData[i].BUNDLE_NO}'
                            AND CATEGORY = '${arrayData[i].CATEGORY}'
                            AND SNO_MAIN = '${arrayData[i].SNO_MAIN}'
                            AND SR_CODE = LPAD('${arrayData[i].FROM_OFFICE}', 4, '0')
                            AND SERIAL_NO BETWEEN '${arrayData[i].SERIAL_NO_FROM}' AND '${arrayData[i].SERIAL_NO_TO}'
                        `;
        
                        const deleteResponse = await this.orDao.oDbDelete(deleteQuery, [], { autoCommit: true });
        
                        if (deleteResponse <= 0) {
                            throw new Error(`Failed to delete records for ${arrayData[i].FROM_OFFICE}, ${arrayData[i].DENOMINATION}, ${arrayData[i].BUNDLE_NO}`);
                        }
                    }
        
                    // Insert serial numbers using PL/SQL block
                    for (let i = 0; i < arrayData.length; i++) {
                        const { CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, TO_OFFICE, FROM_OFFICE, SNO_MAIN } = arrayData[i];
                        const serialStart = parseInt(SERIAL_NO_FROM, 10);
                        const serialEnd = parseInt(SERIAL_NO_TO, 10);
        
                        const sql = `
                            BEGIN
                                FOR i IN :start .. :end LOOP
                                    INSERT INTO stamp_manager (SR_CODE, DENOMINATION, BUNDLE_NO, CATEGORY, TYPE, SNO_MAIN, SERIAL_NO, TIME_STAMP) 
                                    VALUES ( CASE
                WHEN LENGTH(:srCode) < 4 THEN LPAD(:srCode, 4, '0')
                ELSE TO_CHAR(:srCode)
            END, :denomination, :bundleNo, :category, :type, :snoMain, i, SYSDATE);
                                END LOOP;
                            END;
                        `;
        
                        const binds = {
                            start: serialStart,
                            end: serialEnd,
                            srCode: TO_OFFICE,
                            denomination: DENOMINATION,
                            bundleNo: BUNDLE_NO,
                            category: CATEGORY,
                            type: TYPE,
                            snoMain: SNO_MAIN
                        };
        
                        console.log('PL/SQL Insert Statement:', sql);
                        console.log('PL/SQL Bind Variables:', binds);
        
                        const insertResponse = await this.orDao.oDbInsertDocsWithBindParams(sql, binds, { autoCommit: true });
        
                        if (insertResponse <= 0) {
                            throw new Error(`Failed to insert serial numbers for ${TO_OFFICE}, ${DENOMINATION}, ${BUNDLE_NO}`);
                        }
                }
            } else {
                throw new Error('Failed to insert records into dist_stock_reg_sno');
            }
    
            return response;
        } catch (ex) {
            Logger.error("stampsServices - NodalDistriwithS || Error :", ex);
            console.error("stampsServices - NodalDistriwithS || Error :", ex);
            throw constructCARDError(ex);
        }
    };
    


    

    NodalDistriwithS1 = async (reqData) => {
        try {
            let response;
            let responseArray = [];
            let arrayData = reqData.stamps;
    
            // First insertion
            for (let i = 0; i < arrayData.length; i++) {
                let query = `INSERT INTO dist_stock_reg_sno (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, SNO_MAIN, STAMP_CODE, SERIAL_NO) 
                    VALUES (
                        TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
                        '${arrayData[i].RECEIVED_BY}',
                        '${arrayData[i].CATEGORY}',
                        '${arrayData[i].TYPE}',            
                        '${arrayData[i].DENOMINATION}',
                        '${arrayData[i].BUNDLE_NO}',
                        '${arrayData[i].SERIAL_NO_FROM}',
                        '${arrayData[i].SERIAL_NO_TO}',
                        '${arrayData[i].DELIVERED_BY}',
                        LPAD('${arrayData[i].TO_OFFICE}', 4, '0'),
                        LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
                        SYSDATE,
                        '${arrayData[i].SNO_MAIN}',
                        '${arrayData[i].STAMP_CODE}',
                        '')`;
                responseArray.push(query);
            }
    
            response = await this.orDao.oDbInsertMultipleDocs(responseArray, 'Nodal Entry register with serialno');
            console.log('Insertion Response:', response);
    
            if (response >= 1) {
                // Delete records in a loop
                for (let i = 0; i < arrayData.length; i++) {
                    const deleteQuery = `DELETE FROM STAMP_MANAGER 
                                         WHERE DENOMINATION = '${arrayData[i].DENOMINATION}' 
                                         AND BUNDLE_NO = '${arrayData[i].BUNDLE_NO}'
                                         AND CATEGORY = '${arrayData[i].CATEGORY}'
                                         AND SNO_MAIN = '${arrayData[i].SNO_MAIN}'
                                         AND SR_CODE = LPAD('${arrayData[i].FROM_OFFICE}', 4, '0')
                                         AND SERIAL_NO BETWEEN '${arrayData[i].SERIAL_NO_FROM}' AND '${arrayData[i].SERIAL_NO_TO}'`;
    
                    const deleteResponse = await this.orDao.oDbDelete(deleteQuery, [], { autoCommit: true });
    
                    if (deleteResponse <= 0) {
                        throw new Error(`Failed to delete records for ${arrayData[i].FROM_OFFICE}, ${arrayData[i].DENOMINATION}, ${arrayData[i].BUNDLE_NO}`);
                    }
                }
    
                // Insert serial numbers using PL/SQL block
                for (let i = 0; i < arrayData.length; i++) {
                    const { CATEGORY, TYPE, DENOMINATION, BUNDLE_NO, SERIAL_NO_FROM, SERIAL_NO_TO, TO_OFFICE, FROM_OFFICE, SNO_MAIN, STAMP_CODE } = arrayData[i];
                    const serialStart = parseInt(SERIAL_NO_FROM, 10);
                    const serialEnd = parseInt(SERIAL_NO_TO, 10);
    
                    const sql = `
                        BEGIN
                            FOR i IN :start..:end LOOP
                                INSERT INTO stamp_manager (SR_CODE, DENOMINATION, BUNDLE_NO, CATEGORY, TYPE, SNO_MAIN, SERIAL_NO, TIME_STAMP) 
                                VALUES (:srCode, :denomination, :bundleNo, :category, :type, :snoMain, i, SYSDATE);
                            END LOOP;
                        END;
                    `;
    
                    const binds = {
                        start: serialStart,
                        end: serialEnd,
                        srCode: TO_OFFICE,
                        denomination: DENOMINATION,
                        bundleNo: BUNDLE_NO,
                        category: CATEGORY,
                        type: TYPE,
                        snoMain: SNO_MAIN
                    };
                    console.log('PL/SQL Insert Statement:', sql);
                    console.log('PL/SQL Bind Variables:', binds);
    
                    const insertResponse = await this.orDao.oDbInsertDocsWithBindParams(sql, binds, { autoCommit: true });
    
                    if (insertResponse <= 0) {
                        throw new Error(`Failed to insert serial numbers for ${TO_OFFICE}, ${DENOMINATION}, ${BUNDLE_NO}`);
                    }
                }
            } else {
                throw new Error('Failed to insert records into dist_stock_reg_sno');
            }
    
            return response;
        } catch (ex) {
            Logger.error("stampsServices - NodalDistriwithS || Error :", ex);
            console.error("stampsServices - NodalDistriwithS || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    


    NodalDistriwithoutS = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.stamps; 
			for (let i = 0; i < arrayData.length; i++) {
				let query = ` INSERT INTO dist_stock_reg (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, SERIAL_NO_TO, DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, STAMP_CODE,INDENT_NO) values
                (TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
                '${arrayData[i].RECEIVED_BY}',
				'${arrayData[i].CATEGORY}',
				'${arrayData[i].TYPE}',			
				'${arrayData[i].DENOMINATION}',
				'${arrayData[i].SERIAL_NO_TO}',
                '${arrayData[i].DELIVERED_BY}',
                 LPAD('${arrayData[i].TO_OFFICE}', 4, '0'),
                 LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
                 sysdate,
                '${arrayData[i].STAMP_CODE}',
                '${arrayData[i].INDENT_NO}')`;
				responseArray.push(query);
			}
			response = await this.orDao.oDbInsertMultipleDocs(responseArray,'Nodal Entry register without serialno');
			return response;
		} catch (ex) {
            Logger.error("stampsServices - NodalStampsDistrbutioniwithoutSerialNo || Error :", ex);
			console.error("stampsServices - NodalStampsDistrbutioniwithoutSerialNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}

    DeletenodalEntryRegisterS = async (reqData) => {
        try {

            let status1 = `WITH RequiredSerials AS (
                SELECT  ${reqData.SERIAL_NO_FROM} + LEVEL - 1 AS serial_no
                FROM DUAL
                CONNECT BY LEVEL <=  ${reqData.SERIAL_NO_TO} -  ${reqData.SERIAL_NO_FROM} + 1
            ),
            SerialCheck AS (
                SELECT 
                    r.serial_no,
                    CASE 
                        WHEN s.serial_no IS NOT NULL THEN 'Y' 
                        ELSE 'N' 
                    END AS status
                FROM 
                    RequiredSerials r
                LEFT JOIN 
                    stamp_manager s 
                ON 
                    r.serial_no = s.serial_no
                    AND s.denomination = '${reqData.DENOMINATION}'
                    AND s.bundle_no = '${reqData.BUNDLE_NO}'
                    AND s.category = '${reqData.CATEGORY}'
                    AND s.type = '${reqData.TYPE}'
                    AND s.sno_main = '${reqData.SNO_MAIN}'
                    AND s.sr_code = '${reqData.FROM_OFFICE}'
            )
            SELECT 
                CASE 
                    WHEN COUNT(CASE WHEN status = 'N' THEN 1 END) > 0 THEN 'N' 
                    ELSE 'Y' 
                END AS final_status
            FROM 
                SerialCheck`;
                let statusFunctionres1 = await this.orDao.oDBQueryService(status1);
                console.log(statusFunctionres1);
                
                if (statusFunctionres1[0].FINAL_STATUS === 'N') {
                    const error = new Error('All stamps are not available to delete in Main Stock');
                    error.statusCode = 200; 
                    throw error;
                }
            const query = `delete main_stock_reg_sno WHERE RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND DENOMINATION = '${reqData.DENOMINATION}' AND BUNDLE_NO = '${reqData.BUNDLE_NO}' AND SNO_MAIN = '${reqData.SNO_MAIN}'`;     
                   let response = await this.orDao.oDbDelete(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - DeletenodalEntryRegisterS || Error :", ex);
            console.error("stampsServices - DeletenodalEntryRegisterS || Error :", ex);
            throw ex;  // Re-throw the error after logging it
        }
    }
    DeletenodalEntryRegisterwithoutS = async (reqData) => {
        try {
            let query = `delete main_stock_reg WHERE RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND DENOMINATION = '${reqData.DENOMINATION}'`;
            let response = await this.orDao.oDbDelete(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - DeletenodalEntryRegisterS || Error :", ex);
            console.error("stampsServices - DeletenodalEntryRegisterS || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    GetnodalEntryRegisterS = async (reqData) => {
        try {
            let query = `select distinct a.*,b.name from main_stock_reg_sno a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - GetnodalEntryRegisterS || Error :", ex);
            console.error("stampsServices - GetnodalEntryRegisterS || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    GetnodalEntryRegisterwithoutS = async (reqData) => {
        try {
            let query = `select distinct a.*,b.name from main_stock_reg a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - GetnodalEntryRegisterwithoutS || Error :", ex);
            console.error("stampsServices - GetnodalEntryRegisterwithoutS || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    DeleteNodalDistriwithS = async (reqData) => {
        try {
            let query = `delete dist_stock_reg_sno  WHERE RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND TO_OFFICE='${reqData.TO_OFFICE}' AND DENOMINATION = '${reqData.DENOMINATION}' AND BUNDLE_NO = '${reqData.BUNDLE_NO}' AND SNO_MAIN = '${reqData.SNO_MAIN}' AND FROM_OFFICE = '${reqData.FROM_OFFICE}' AND STAMP_CODE = '${reqData.STAMP_CODE}' AND SERIAL_NO_FROM='${reqData.SERIAL_NO_FROM}' AND SERIAL_NO_TO='${reqData.SERIAL_NO_TO}' `;
            let response = await this.orDao.oDbDelete(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - DeleteNodalDistriwithS || Error :", ex);
            console.error("stampsServices - DeleteNodalDistriwithS || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    DeleteNodalDistriwithOutS = async (reqData) => {
        try {
            let queryget =`INSERT INTO dist_stock_reg (
  RECEIVED_DATE, 
  RECEIVED_BY, 
  CATEGORY, 
  TYPE, 
  DENOMINATION, 
  SERIAL_NO_TO, 
  DELIVERED_BY, 
  TO_OFFICE, 
  FROM_OFFICE, 
  TIME_STAMP, 
  INDENT_NO, 
  STAMP_CODE
)
SELECT 
  RECEIVED_DATE, 
  RECEIVED_BY,  
  CATEGORY, 
  TYPE, 
  DENOMINATION, 
  '${reqData.PARTIAL_NO}' as SERIAL_NO_TO, 
  DELIVERED_BY, 
  TO_OFFICE, 
  FROM_OFFICE, 
  TIME_STAMP, 
  INDENT_NO, 
  STAMP_CODE
FROM dist_stock_reg
WHERE 
  RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY')
  AND DENOMINATION = '${reqData.DENOMINATION}'
  AND STAMP_CODE = '${reqData.STAMP_CODE}'
  AND TO_OFFICE = '${reqData.TO_OFFICE}'
  AND FROM_OFFICE = '${reqData.FROM_OFFICE}'
  and SERIAL_NO_TO='${reqData.TOTAL_NO}'
  AND ROWNUM = 1`;
  let response1 = await this.orDao.oDbUpdateWithOutBreak(queryget);
  console.log(response1,'res1');
            let query = `delete dist_stock_reg  WHERE RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND DENOMINATION = ${reqData.DENOMINATION} AND STAMP_CODE = '${reqData.STAMP_CODE}' AND TO_OFFICE = '${reqData.TO_OFFICE}' AND FROM_OFFICE = '${reqData.FROM_OFFICE}'   and SERIAL_NO_TO='${reqData.TOTAL_NO}' AND ROWNUM = 1`;
            let response = await this.orDao.oDbDelete(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - DeleteNodalDistriwithOutS || Error :", ex);
            console.error("stampsServices - DeleteNodalDistriwithOutS || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getDistri = async (reqData) => {
        try {
            let query;
    
            if(reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}' `;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getDistri || Error :", ex);
            console.error("stampsServices - getDistri || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    
    getNodalDistri = async (reqData) => {
        try {
            let query;
    
            if(reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}' `;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE = '${reqData.FROM_OFFICE}'`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getNodalDistri || Error :", ex);
            console.error("stampsServices - getNodalDistri || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getDistriWithoutSerial = async (reqData) => {
        try {
            let query;
    
            if(reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.stamp_code='${reqData.STAMP_CODE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.stamp_code='${reqData.STAMP_CODE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE && reqData.TO_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getDistriWithoutSerial || Error :", ex);
            console.error("stampsServices - getDistriWithoutSerial || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    
    getNodalDistriWithoutSerial = async (reqData) => {
        try {
            let query;
    
            if        (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.stamp_code='${reqData.STAMP_CODE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.stamp_code='${reqData.STAMP_CODE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE && reqData.TO_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getNodalDistriWithoutSerial || Error :", ex);
            console.error("stampsServices - getNodalDistriWithoutSerial || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getDistrictsAsperdiststamps = async (reqData) => {
        try {
            let query = `SELECT distinct a.to_office,c.dr_name FROM dist_stock_reg_sno a,dr_master c WHERE  a.TO_OFFICE=c.dr_cd  AND a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getdistrictsasperdiststamps || Error :", ex);
            console.error("stampsServices - getdistrictsasperdiststamps || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getSrosAsperdiststamps = async (reqData) => {
        try {
            let query = `SELECT  distinct a.to_office,c.sr_name FROM dist_stock_reg_sno a,sr_master c WHERE  a.TO_OFFICE=c.SR_CD  AND a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getdistrictsasperdiststamps || Error :", ex);
            console.error("stampsServices - getdistrictsasperdiststamps || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getDistrictsAsperdiststampsout = async (reqData) => {
        try {
            let query = `SELECT distinct a.to_office,c.dr_name FROM dist_stock_reg a,dr_master c WHERE  a.TO_OFFICE=c.dr_cd  AND a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getDistrictsAsperdiststampsout || Error :", ex);
            console.error("stampsServices - getDistrictsAsperdiststampsout || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getSrosAsperdiststampsout = async (reqData) => {
        try {
            let query = `SELECT  distinct a.to_office,c.sr_name FROM dist_stock_reg a,sr_master c WHERE  a.TO_OFFICE=c.SR_CD  AND a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getSrosAsperdiststampsout || Error :", ex);
            console.error("stampsServices - getSrosAsperdiststampsout || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getbalancestampsforwithserail = async (reqData) => {
        try {
            let query = `WITH CTE AS (SELECT 
                                         BUNDLE_NO,
                                         SNO_MAIN,
                                         SERIAL_NO,
                                         LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
                                         LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
                                    FROM STAMP_MANAGER WHERE SR_CODE=LPAD('${reqData.FROM_OFFICE}', 4, '0') AND DENOMINATION='${reqData.DENOMINATION}' AND CATEGORY='${reqData.CATEGORY}' AND TYPE='${reqData.TYPE}' AND SNO_MAIN='${reqData.SNO_MAIN}'),
                                Grouped  AS (
                                         SELECT 
                                        BUNDLE_NO,
                                        SNO_MAIN,
                                        SERIAL_NO,
                                        SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS grp
                                    FROM CTE ),
                                         Ranges AS (
                                                   SELECT 
                                                     BUNDLE_NO,
                                                     SNO_MAIN,
                                                     MIN(SERIAL_NO) AS SERIAL_NO_FROM,
                                                     MAX(SERIAL_NO) AS SERIAL_NO_TO
                                                FROM Grouped
                                                     GROUP BY BUNDLE_NO, SNO_MAIN, grp )
                                         SELECT 
                                                BUNDLE_NO,
                                                SNO_MAIN,
                                                SERIAL_NO_FROM, 
                                                SERIAL_NO_TO
                                           FROM Ranges
                                                ORDER BY BUNDLE_NO, SNO_MAIN, SERIAL_NO_FROM`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getbalancestampsforwithserail || Error :", ex);
            console.error("stampsServices - getbalancestampsforwithserail || Error :", ex);
            throw constructCARDError(ex);
        }
    }




    getbalancestampsforwithOutserail = async (reqData) => {
        try {
            let query = `SELECT * FROM CCA_STOCK_REG WHERE SR_CODE=LPAD('${reqData.FROM_OFFICE}', 4, '0') AND DENOMINATION='${reqData.DENOMINATION}' AND CATEGORY='${reqData.CATEGORY}' AND TYPE='${reqData.TYPE}' AND STAMP_CODE='${reqData.STAMP_CODE}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getbalancestampsforwithOutserail || Error :", ex);
            console.error("stampsServices - getbalancestampsforwithOutserail || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getVenderlist = async (reqData) => {
        try {
            let query = `select VEN_NAME,LICENSE_NO from card.stamp_venlist WHERE SR_CD='${reqData.FROM_OFFICE}' AND (STATUS = 'Y' OR STATUS is null)`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getVenderlist || Error :", ex);
           console.error("stampsServices - getVenderlist || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getVenderlistforresurender = async (reqData) => {
        try {
            let query = `select VEN_NAME,LICENSE_NO from card.stamp_venlist WHERE LICENSE_NO in (select to_office from dist_stock_reg_sno where from_office=LPAD('${reqData.FROM_OFFICE}',4,'0') and received_date=to_date('${reqData.RECEIVED_DATE}','DD-MM-YYYY') ) AND sr_cd='${reqData.FROM_OFFICE}'  AND (STATUS = 'Y' OR STATUS is null)`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getVenderlistforresurender || Error :", ex);
           console.error("stampsServices - getVenderlistforresurender || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    SroCitizenSaleDetails = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.stampsCitizen; 
			for (let i = 0; i < arrayData.length; i++) {
				let query = `INSERT INTO SROUSER.CCA_SALE_IND (SDATE, INDENT_NO, PARTY_NAME, PARTY_RELATION, ADDRESS_1, ADDRESS_2, FOR_WHOM, SALE_PARTY_RELATION, ADDRESS_3, ADDRESS_4, MODE_OF_PAYMENT, DD_CHALLAN_NO, DDDATE, BCODE, SR_CODE) VALUES 
             ( SYSDATE,
                '${arrayData[i].INDENT_NO}',
				'${arrayData[i].PARTY_NAME}',
				'${arrayData[i].PARTY_RELATION}',			
				'${arrayData[i].ADDRESS_1}',
				'${arrayData[i].ADDRESS_2}',
                '${arrayData[i].FOR_WHOM}',
                '${arrayData[i].SALE_PARTY_RELATION}',
                '${arrayData[i].ADDRESS_3}',
                '${arrayData[i].ADDRESS_4}',
                '${arrayData[i].MODE_OF_PAYMENT}',
                 CASE 
                       WHEN 'CA' = '${arrayData[i].MODE_OF_PAYMENT}' THEN NULL      
                       ELSE '${arrayData[i].DD_CHALLAN_NO}'             
                 END,
                 CASE 
                       WHEN 'CA' = '${arrayData[i].MODE_OF_PAYMENT}' THEN NULL      
                       ELSE TO_DATE('${arrayData[i].DDDATE}', 'DD-MM-YYYY')  
                 END,
                 CASE 
                       WHEN 'CA' = '${arrayData[i].MODE_OF_PAYMENT}' THEN NULL     
                       ELSE '${arrayData[i].BCODE}'              
                 END,
                '${arrayData[i].SR_CODE}')`;
				responseArray.push(query);
			}
			response = await this.orDao.oDbInsertMultipleDocs(responseArray,'SroCitizenDistri');
			return response;
		} catch (ex) {
            Logger.error("stampsServices - SroCitizenSaleDetails || Error :", ex);
			console.error("stampsServices - SroCitizenSaleDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}

    getVenderlistforDr = async (reqData) => {
        try {
            let query;
    
            if (reqData.DR_CD && reqData.SR_CD) {
                query = `select * from card.stamp_venlist WHERE DR_CD='${reqData.DR_CD}' AND SR_CD='${reqData.SR_CD}' AND (STATUS = 'Y' OR STATUS is null)`;
            } else if (reqData.DR_CD) {
                query = `select * from card.stamp_venlist WHERE DR_CD='${reqData.DR_CD}' AND (STATUS = 'Y' OR STATUS is null)`;
            } 
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getVenderlistforDr || Error :", ex);
            console.error("stampsServices - getVenderlistforDr || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getBlockedVenderlistforDr = async (reqData) => {
        try {
            let query;
    
            if (reqData.DR_CD && reqData.SR_CD) {
                query = `select a.*,(select sr_name from sr_master i where i.sr_cd = a.sr_cd and ROWNUM=1) as SR_NAME FROM  card.stamp_venlist a WHERE a.DR_CD='${reqData.DR_CD}' AND a.SR_CD='${reqData.SR_CD}' and a.STATUS='B'`;
            } else if (reqData.DR_CD) {
                query = `select a.*,(select sr_name from sr_master i where i.sr_cd = a.sr_cd and ROWNUM=1) as SR_NAME FROM  card.stamp_venlist a WHERE a.DR_CD='${reqData.DR_CD}' and a.STATUS='B'`;
            } 
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getBlockedVenderlistforDr || Error :", ex);
            console.error("stampsServices - getBlockedVenderlistforDr || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    blockVender = async (reqData) => {
        try {
            let query = `update card.stamp_venlist set STATUS='B',BLOCK_UNBLOCK_REASON='${reqData.REASON}' WHERE DR_CD='${reqData.DR_CD}' AND SR_CD='${reqData.SR_CD}' AND LICENSE_NO='${reqData.LICENSE_NO}'`;
            let response = await this.orDao.oDbUpdate(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - blockVender || Error :", ex);
            console.error("stampsServices - blockVender || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    UnblockVender = async (reqData) => {
        try {
            let query = `update card.stamp_venlist set STATUS='Y',BLOCK_UNBLOCK_REASON='${reqData.REASON}' WHERE DR_CD='${reqData.DR_CD}' AND SR_CD='${reqData.SR_CD}' AND LICENSE_NO='${reqData.LICENSE_NO}'`;
            let response = await this.orDao.oDbUpdate(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - UnblockVender || Error :", ex);
            console.error("stampsServices - UnblockVender || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getboxmainfromtoforwithserail = async (reqData) => {
        try {
            let query = `WITH CTE AS (
                                   SELECT 
                                     BUNDLE_NO,
                                     SNO_MAIN,
                                     SERIAL_NO,
                                       LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
                                       LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
                                  FROM STAMP_MANAGER 
                                WHERE SR_CODE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
                                      AND DENOMINATION = '${reqData.DENOMINATION}' 
                                         AND CATEGORY = '${reqData.CATEGORY}' 
                                          AND TYPE = '${reqData.TYPE}'),
                                    Grouped AS (
                                              SELECT 
                                                BUNDLE_NO,
                                                SNO_MAIN,
                                                SERIAL_NO,
                                                SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS grp
                                         FROM CTE ),
                                   Ranges AS (
                                     SELECT 
                                        BUNDLE_NO
                                           FROM Grouped
                                        GROUP BY BUNDLE_NO, grp )
                                        SELECT 
                                           DISTINCT 
                                           BUNDLE_NO
                                        FROM Ranges
                                   ORDER BY BUNDLE_NO`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getboxmainfromtoforwithserail || Error :", ex);
            console.error("stampsServices - getboxmainfromtoforwithserail || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getmainfromtoforwithserail = async (reqData) => {
        try {
            let query = ` WITH CTE AS (
    SELECT 
        BUNDLE_NO,
        SNO_MAIN,
        SERIAL_NO,
        LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
        LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    FROM STAMP_MANAGER 
    WHERE SR_CODE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
        AND DENOMINATION = '${reqData.DENOMINATION}' 
        AND CATEGORY = '${reqData.CATEGORY}' 
        AND TYPE = '${reqData.TYPE}'
        AND BUNDLE_NO = '${reqData.BUNDLE_NO}'
),
Grouped AS (
    SELECT 
        BUNDLE_NO,
        SNO_MAIN,
        SERIAL_NO,
        SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    FROM CTE
),
Ranges AS (
    SELECT 
        SNO_MAIN
    FROM Grouped
    GROUP BY SNO_MAIN, grp
)
SELECT 
    DISTINCT SNO_MAIN
FROM Ranges
ORDER BY SNO_MAIN`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getmainfromtoforwithserail || Error :", ex);
            console.error("stampsServices - getmainfromtoforwithserail || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getfromtoforwithserail = async (reqData) => {
        try {
            let query = `        
                   WITH CTE AS (
        SELECT 
            BUNDLE_NO,
            SNO_MAIN,
            SERIAL_NO,
            LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
            LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
        FROM STAMP_MANAGER 
          WHERE SR_CODE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
          AND DENOMINATION = '${reqData.DENOMINATION}' 
          AND CATEGORY = '${reqData.CATEGORY}' 
          AND TYPE = '${reqData.TYPE}'
          AND BUNDLE_NO='${reqData.BUNDLE_NO}'
          AND SNO_MAIN='${reqData.SNO_MAIN}'
    ),
    Grouped AS (
        SELECT 
            BUNDLE_NO,
            SNO_MAIN,
            SERIAL_NO,
            SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, SNO_MAIN ORDER BY SERIAL_NO) AS grp
        FROM CTE
    ),
    Ranges AS (
        SELECT 
            MIN(SERIAL_NO) AS SERIAL_NO_FROM,
            MAX(SERIAL_NO) AS SERIAL_NO_TO
        FROM Grouped
        GROUP BY BUNDLE_NO, SNO_MAIN, grp
    )
    SELECT 
        SERIAL_NO_FROM, 
        SERIAL_NO_TO
    FROM Ranges
    ORDER BY SERIAL_NO_FROM`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - getfromtoforwithserail || Error :", ex);
            console.error("stampsServices - getfromtoforwithserail || Error :", ex);
            throw constructCARDError(ex);
        }
    }    
    getSerialMainstockDateList = async () => {
        try {
            let query = `SELECT FORMATTED_RECEIVED_DATE 
            FROM 
            (SELECT DISTINCT TO_CHAR(RECEIVED_DATE, 'DD-MM-YYYY') AS FORMATTED_RECEIVED_DATE, RECEIVED_DATE FROM MAIN_STOCK_REG_SNO)
            ORDER BY RECEIVED_DATE DESC`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getSerialMainstockDateList || Error :", ex);
           console.error("stampsServices - getSerialMainstockDateList || Error :", ex);
           throw constructCARDError(ex);
        }
    }

    getNonSerialMainstockDateList = async () => {
        try {
            let query = `SELECT FORMATTED_RECEIVED_DATE 
            FROM 
            (SELECT DISTINCT TO_CHAR(RECEIVED_DATE, 'DD-MM-YYYY') AS FORMATTED_RECEIVED_DATE, RECEIVED_DATE FROM MAIN_STOCK_REG)
            ORDER BY RECEIVED_DATE DESC`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getNonSerialMainstockDateList || Error :", ex);
           console.error("stampsServices - getNonSerialMainstockDateList || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getDistributedSerialStampsDateList= async (reqData) => {
        try {
            let query = `SELECT DATE_LIST 
            FROM 
            (SELECT DISTINCT TO_CHAR(RECEIVED_DATE, 'DD-MM-YYYY') AS DATE_LIST, RECEIVED_DATE FROM DIST_STOCK_REG_SNO WHERE FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0'))
            ORDER BY RECEIVED_DATE DESC`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getDistributedSerialStampsDateList || Error :", ex);
           console.error("stampsServices - getDistributedSerialStampsDateList || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getDistributedSerialVendorStampsDateList= async (reqData) => {
        try {
            let query = `SELECT DATE_LIST 
            FROM 
            (SELECT DISTINCT TO_CHAR(RECEIVED_DATE, 'DD-MM-YYYY') AS DATE_LIST, RECEIVED_DATE FROM DIST_STOCK_REG_SNO WHERE FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0')  and length(to_office)>9)
            ORDER BY RECEIVED_DATE DESC`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getDistributedSerialVendorStampsDateList || Error :", ex);
           console.error("stampsServices - getDistributedSerialVendorStampsDateList || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getDistributedNONSerialStampsDateList= async (reqData) => {
        try {
            let query = `SELECT DATE_LIST 
            FROM 
            (SELECT DISTINCT TO_CHAR(RECEIVED_DATE, 'DD-MM-YYYY') AS DATE_LIST, RECEIVED_DATE FROM DIST_STOCK_REG WHERE FROM_OFFICE='${reqData.FROM_OFFICE}')
            ORDER BY RECEIVED_DATE DESC`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getDistributedNONSerialStampsDateList || Error :", ex);
           console.error("stampsServices - getDistributedNONSerialStampsDateList || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getIndentFormFromPdeSerial= async (reqData) => {
        try {
            let query;
    
            if(reqData.FROM_OFFICE && reqData.RECEIPT_NO) {
                query = `select A.*,NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH,TO_CHAR((select ENTRY_DATE from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1), 'DD-MM-YYYY') AS DDDATE  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y' AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}' AND A.MIS_RECEIPT_NO='${reqData.RECEIPT_NO}' AND A.STAMP_CODE='14' AND A.DENOMINATION  IN ('10','20','100','50')`;
            } else if (reqData.FROM_OFFICE) {
                query = `select DISTINCT A.MIS_RECEIPT_NO AS RECEIPT_NO ,A.PURCHASER_NAME,NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' and i.reg_year = A.purchase_year AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y' AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}'  AND A.STAMP_CODE='14' AND A.DENOMINATION  IN ('10','20','100','50') AND A.MIS_RECEIPT_NO IS NOT NULL  AND NOT REGEXP_LIKE(A.PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$') AND REGEXP_LIKE(A.PURCHASER_NAME, '[A-Za-z]')`;
            }
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getIndentFormFromPdeSerial || Error :", ex);
            console.error("stampsServices - getIndentFormFromPdeSerial || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getIndentFormFromPdeNONSerial = async (reqData) => {
      try {
        let query;
  
        if (reqData.FROM_OFFICE && reqData.RECEIPT_NO) {
          query = `select A.*,NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH, TO_CHAR((select ENTRY_DATE from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1), 'DD-MM-YYYY') AS DDDATE  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y' AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}' AND A.MIS_RECEIPT_NO='${reqData.RECEIPT_NO}'`;
        } else if (reqData.FROM_OFFICE) {
          query = `select  DISTINCT A.MIS_RECEIPT_NO AS RECEIPT_NO,A.PURCHASER_NAME, NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y'  AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}' AND A.MIS_RECEIPT_NO IS NOT NULL AND NOT REGEXP_LIKE(A.PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$') AND REGEXP_LIKE(A.PURCHASER_NAME, '[A-Za-z]') AND   NOT ( A.STAMP_CODE =('14') AND A.denomination IN (10, 20, 50, 100))`;
        }
        if (query) {
          let response = await this.orDao.oDBQueryService(query);
          return response;
        } else {
          throw new Error("Required parameters are missing from reqData");
        }
      } catch (ex) { Logger.error("stampsServices - getIndentFormFromPdeNONSerial || Error :",ex);
        console.error("stampsServices - getIndentFormFromPdeNONSerial || Error :",ex);
        throw constructCARDError(ex);
      }
    };
    getIndentFormVENDER = async (reqData) => {
      try {
        let query;
  
        if (reqData.FROM_OFFICE && reqData.RECEIPT_NO) {
          query = `select  A.*,(select VEN_NAME  from card.stamp_venlist i where i.license_no=A.purchaser_name and rownum=1) as NAME , NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y' AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}' AND A.MIS_RECEIPT_NO='${reqData.RECEIPT_NO}' AND A.DENOMINATION IN ('10','20','100','50') AND REGEXP_LIKE(A.PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')`;
        } else if (reqData.FROM_OFFICE) {
          query = `select DISTINCT A.MIS_RECEIPT_NO AS RECEIPT_NO,A.PURCHASER_NAME,(select VEN_NAME  from card.stamp_venlist i where i.license_no=A.purchaser_name and rownum=1) as NAME ,NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' and i.reg_year = A.purchase_year AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y' AND A.STAMP_CODE='14'  AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}'   AND A.DENOMINATION IN ('10','20','100','50') AND A.MIS_RECEIPT_NO IS NOT NULL AND REGEXP_LIKE(A.PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')`;
        }
        if (query) {
          let response = await this.orDao.oDBQueryService(query);
          console.log(query);
          return response;
        } else {
          throw new Error("Required parameters are missing from reqData");
        }
      } catch (ex) {
        Logger.error("stampsServices - getIndentFormVENDER || Error :", ex);
        console.error("stampsServices - getIndentFormVENDER || Error :", ex);
        throw constructCARDError(ex);
      }
    };

    updateIndentStatus = async (reqData) => {
        try {
            let query = `UPDATE srouser.stamp_indent SET DISTRIBUTION_STATUS='Y' WHERE MIS_RECEIPT_NO='${reqData.RECEIPT_NO}' AND SR_CODE='${reqData.FROM_OFFICE}'`;
            let response = await this.orDao.oDbUpdate(query);
            return response;
        } catch (ex) {
            Logger.error("stampsServices - updateIndentStatus || Error :", ex);
            console.error("stampsServices - updateIndentStatus || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    
    getSroToVenderDistri = async (reqData) => {
        try {
            let query;
    
            if(reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}' `;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            } else if (reqData.RECEIVED_DATE && reqData.TO_OFFICE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
            } else if (reqData.RECEIVED_DATE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE = TO_DATE('${reqData.RECEIVED_DATE}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0')`;
            }
    console.log(query);
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getSroToVenderDistri || Error :", ex);
            console.error("stampsServices - getSroToVenderDistri || Error :", ex);
            throw constructCARDError(ex);
        }
    }




    // --------------------------------------Districbuted Reports services-------------------------------//


    getDRDistriReport = async (reqData) => {
        try {
            let query;
    
            if(reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}' ORDER BY RECEIVED_DATE ASC `;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') AND a.DENOMINATION = '${reqData.DENOMINATION}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE ) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' ORDER BY RECEIVED_DATE ASC`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getDRDistriReport || Error :", ex);
            console.error("stampsServices - getDRDistriReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    
    getNodalDistriReport = async (reqData) => {
        try {
            let query;
    
            if(reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME  FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE = '${reqData.FROM_OFFICE}' ORDER BY RECEIVED_DATE ASC`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getNodalDistriReport || Error :", ex);
            console.error("stampsServices - getNodalDistriReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getDRDistriWithoutSerialReport = async (reqData) => {
        try {
            let query;
    
            if(reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.stamp_code='${reqData.STAMP_CODE}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') AND AND a.stamp_code='${reqData.STAMP_CODE}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE && reqData.TO_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0') ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.TO_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' ORDER BY RECEIVED_DATE ASC`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getDRDistriWithoutSerialReport || Error :", ex);
            console.error("stampsServices - getDRDistriWithoutSerialReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    
    getNodalDistriWithoutSerialReport = async (reqData) => {
        try {
            let query;
    
            if        (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.stamp_code='${reqData.STAMP_CODE}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.FROM_OFFICE && reqData.STAMP_CODE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.stamp_code='${reqData.STAMP_CODE}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE && reqData.TO_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' ORDER BY RECEIVED_DATE ASC`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.dr_name,(select EMPL_NAME FROM employee_login_master i where TO_CHAR(i.EMPL_ID)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN dr_master c ON a.TO_OFFICE = c.dr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getNodalDistriWithoutSerialReport || Error :", ex);
            console.error("stampsServices - getNodalDistriWithoutSerialReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getSroToVenderDistriReport = async (reqData) => {
        try {
            let query;
    
            if(reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}' `;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE && reqData.BUNDLE_NO) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}'`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.FROM_OFFICE}',4,'0') AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
            } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE=LPAD('${reqData.TO_OFFICE}',4,'0')`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getSroToVenderDistriReport || Error :", ex);
            console.error("stampsServices - getSroToVenderDistriReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getSroToCitizenDistriReport= async (reqData) => {
        try {
            let query;
    
            if (reqData.FROM_OFFICE && reqData.fromDate && reqData.toDate && reqData.TO_OFFICE ) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select PARTY_NAME FROM SROUSER.CCA_SALE_IND i where TO_CHAR(i.INDENT_NO)=a.INDENT_NO AND i.sr_code= LPAD(a.from_office, 4,'0') AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') and a.from_office=LPAD('${reqData.FROM_OFFICE}', 4, '0')  and a.to_office='${reqData.TO_OFFICE}'`;
            } else if (reqData.FROM_OFFICE && reqData.fromDate && reqData.toDate && reqData.TO_OFFICE ) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select PARTY_NAME FROM SROUSER.CCA_SALE_IND i where TO_CHAR(i.INDENT_NO)=a.INDENT_NO AND i.sr_code= LPAD(a.from_office, 4,'0') AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg_sno a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') and a.from_office=LPAD('${reqData.FROM_OFFICE}', 4, '0')  and a.to_office='${reqData.TO_OFFICE}'`;
            }
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getSroToCitizenDistriReport || Error :", ex);
            console.error("stampsServices - getSroToCitizenDistriReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getSroToCitizenDistriNReport= async (reqData) => {
        try {
            let query;
    
            if (reqData.FROM_OFFICE && reqData.fromDate && reqData.toDate && reqData.TO_OFFICE ) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select PARTY_NAME FROM SROUSER.CCA_SALE_IND i where TO_CHAR(i.INDENT_NO)=a.INDENT_NO AND i.sr_code= LPAD(a.from_office, 4,'0') AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') and a.from_office=LPAD('${reqData.FROM_OFFICE}', 4, '0')  and a.to_office='${reqData.TO_OFFICE}'`;
            } else if (reqData.FROM_OFFICE && reqData.fromDate && reqData.toDate && reqData.TO_OFFICE ) {
                query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select PARTY_NAME FROM SROUSER.CCA_SALE_IND i where TO_CHAR(i.INDENT_NO)=a.INDENT_NO AND i.sr_code= LPAD(a.from_office, 4,'0') AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') and a.from_office=LPAD('${reqData.FROM_OFFICE}', 4, '0')  and a.to_office='${reqData.TO_OFFICE}'`;
            }
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getSroToCitizenDistriReport || Error :", ex);
            console.error("stampsServices - getSroToCitizenDistriReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    // getSroToCITIZENDistriReport = async (reqData) => {
    //     try {
    //         let query;
    
    //         if(reqData.fromDate && reqData.toDate && reqData.TO_OFFICE && reqData.DENOMINATION && reqData.FROM_OFFICE) {
    //             query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}' AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
    //         } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE &&  reqData.FROM_OFFICE ) {
    //             query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}' AND a.TO_OFFICE='${reqData.TO_OFFICE}'`;
    //         } else if (reqData.fromDate && reqData.toDate && reqData.FROM_OFFICE  ) {
    //             query = `SELECT DISTINCT a.*, b.name, c.sr_name,(select VEN_NAME FROM CARD.STAMP_VENLIST i where TO_CHAR(i.LICENSE_NO)=a.RECEIVED_BY AND ROWNUM = 1) as EMPL_NAME FROM dist_stock_reg a LEFT JOIN stamp_name b ON a.stamp_code = b.code LEFT JOIN sr_master c ON a.FROM_OFFICE = c.sr_cd WHERE a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.FROM_OFFICE='${reqData.FROM_OFFICE}'`;
    //         }
    
    //         if (query) {
    //             let response = await this.orDao.oDBQueryService(query);
    //             console.log(query);
    //             return response;
    //         } else {
    //             throw new Error("Required parameters are missing from reqData");
    //         }
    //     } catch (ex) {
    //         Logger.error("stampsServices - getSroToVenderDistriReport || Error :", ex);
    //         console.error("stampsServices - getSroToVenderDistriReport || Error :", ex);
    //         throw constructCARDError(ex);
    //     }
    // }

    getMAINSerialEntryReport = async (reqData) => {
        try {
            let query;
    
            if(reqData.fromDate && reqData.toDate &&  reqData.DENOMINATION && reqData.BUNDLE_NO && reqData.SNO_MAIN) {
                query = `select distinct a.*,b.name from main_stock_reg_sno a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}' AND a.SNO_MAIN = '${reqData.SNO_MAIN}'`;
            } else if (reqData.fromDate && reqData.toDate &&  reqData.DENOMINATION  && reqData.BUNDLE_NO) {
                query = `select distinct a.*,b.name from main_stock_reg_sno a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.DENOMINATION = '${reqData.DENOMINATION}' AND a.BUNDLE_NO = '${reqData.BUNDLE_NO}'`;
            } else if (reqData.fromDate && reqData.toDate &&  reqData.DENOMINATION) {
                query = `select distinct a.*,b.name from main_stock_reg_sno a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            } else if (reqData.fromDate && reqData.toDate) {
                query = `select distinct a.*,b.name from main_stock_reg_sno a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY')`;
            }
    
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getMAINSerialEntryReport || Error :", ex);
            console.error("stampsServices - getMAINSerialEntryReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getMAINEntryReport = async (reqData) => {
        try {
            let query;
    
            if(reqData.fromDate && reqData.toDate &&  reqData.DENOMINATION) {
                query = `select distinct a.*,b.name from main_stock_reg a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY') AND a.DENOMINATION = '${reqData.DENOMINATION}'`;
            } else if (reqData.fromDate && reqData.toDate) {
                query = `select distinct a.*,b.name from main_stock_reg a LEFT JOIN stamp_name b on a.stamp_code=b.code where  a.RECEIVED_DATE BETWEEN TO_DATE('${reqData.fromDate}', 'DD/MM/YYYY') AND TO_DATE('${reqData.toDate}', 'DD/MM/YYYY')`;
            } 
            if (query) {
                let response = await this.orDao.oDBQueryService(query);
                console.log(query);
                return response;
            } else {
                throw new Error("Required parameters are missing from reqData");
            }
        } catch (ex) {
            Logger.error("stampsServices - getMAINEntryReport || Error :", ex);
            console.error("stampsServices - getMAINEntryReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    // getBalanceSerilaStampsReport = async (reqData) => {
    //     try {
    //         let query;
    //         if(reqData.FROM_OFFICE && reqData.SNO_MAIN){
    //             query = `WITH CTE AS (SELECT 
    //                                      BUNDLE_NO,
    //                                      DENOMINATION,
    //                                      SNO_MAIN,
    //                                      SERIAL_NO,
    //                                      LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
    //                                      LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    //                                 FROM STAMP_MANAGER WHERE SR_CODE='${reqData.FROM_OFFICE}' AND SNO_MAIN='${reqData.SNO_MAIN}'),
    //                             Grouped  AS (
    //                                      SELECT 
    //                                     BUNDLE_NO,
    //                                     DENOMINATION,
    //                                     SNO_MAIN,
    //                                     SERIAL_NO,
    //                                     SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    //                                 FROM CTE ),
    //                                      Ranges AS (
    //                                                SELECT 
    //                                                  BUNDLE_NO,
    //                                                  DENOMINATION,
    //                                                  SNO_MAIN,
    //                                                  MIN(SERIAL_NO) AS SERIAL_NO_FROM,
    //                                                  MAX(SERIAL_NO) AS SERIAL_NO_TO
    //                                             FROM Grouped
    //                                                  GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, grp )
    //                                      SELECT 
    //                                             BUNDLE_NO,
    //                                             DENOMINATION,
    //                                             SNO_MAIN,
    //                                             SERIAL_NO_FROM, 
    //                                             SERIAL_NO_TO
    //                                        FROM Ranges
    //                                             ORDER BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SERIAL_NO_FROM`;
    //         } else if(reqData.FROM_OFFICE) {
    //            query= ` WITH CTE AS (SELECT 
    //                 BUNDLE_NO,
    //                 DENOMINATION,
    //                 SNO_MAIN,
    //                 SERIAL_NO,
    //                 LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
    //                 LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    //            FROM STAMP_MANAGER WHERE SR_CODE='${reqData.FROM_OFFICE}'),
    //        Grouped  AS (
    //                 SELECT 
    //                BUNDLE_NO,
    //                DENOMINATION,
    //                SNO_MAIN,
    //                SERIAL_NO,
    //                SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    //            FROM CTE ),
    //                 Ranges AS (
    //                           SELECT 
    //                             BUNDLE_NO,
    //                             DENOMINATION,
    //                             SNO_MAIN,
    //                             MIN(SERIAL_NO) AS SERIAL_NO_FROM,
    //                             MAX(SERIAL_NO) AS SERIAL_NO_TO
    //                        FROM Grouped
    //                             GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, grp )
    //                 SELECT 
    //                        BUNDLE_NO,
    //                        DENOMINATION,
    //                        SNO_MAIN,
    //                        SERIAL_NO_FROM, 
    //                        SERIAL_NO_TO
    //                   FROM Ranges
    //                        ORDER BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SERIAL_NO_FROM`;

    //         }
    //         if (query) {
    //             let response = await this.orDao.oDBQueryService(query);
    //             console.log(query);
    //             return response;
    //         } else {
    //             throw new Error("Required parameters are missing from reqData");
    //         }
    //     } catch (ex) {
    //         Logger.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
    //         console.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
    //         throw constructCARDError(ex);
    //     }
    // }


//     getBalanceSerilaStampsReport=  async (reqData) => {
//         try {
//             let query;
            
//             if(reqData.FROM_OFFICE && reqData.DENOMINATION && reqData.BUNDLE_NO && reqData.SNO_MAIN){

//                 query=`WITH CTE AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     SERIAL_NO,
//     LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
//     LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
// FROM STAMP_MANAGER 
// WHERE SR_CODE='${reqData.FROM_OFFICE}' AND denomination='${reqData.DENOMINATION}' and sno_main='${reqData.SNO_MAIN}' and bundle_no='${reqData.BUNDLE_NO}'
// ),
// Grouped AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     SERIAL_NO,
//     SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
// FROM CTE
// ),
// Ranges AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     MIN(SERIAL_NO) AS SERIAL_NO_FROM,
//     MAX(SERIAL_NO) AS SERIAL_NO_TO
// FROM Grouped
// GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, grp
// )
// SELECT 
// BUNDLE_NO,
// DENOMINATION,
// SNO_MAIN,
// SERIAL_NO_FROM, 
// SERIAL_NO_TO,
// SERIAL_NO_TO - SERIAL_NO_FROM + 1 AS COUNT
// FROM Ranges
// ORDER BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SERIAL_NO_FROM`;

//             }
//             else if (reqData.FROM_OFFICE && reqData.DENOMINATION){
// query=`WITH CTE AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     SERIAL_NO,
//     LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
//     LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
// FROM STAMP_MANAGER 
// WHERE SR_CODE='${reqData.FROM_OFFICE}' AND denomination='${reqData.DENOMINATION}'
// ),
// Grouped AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     SERIAL_NO,
//     SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
// FROM CTE
// ),
// Ranges AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     MIN(SERIAL_NO) AS SERIAL_NO_FROM,
//     MAX(SERIAL_NO) AS SERIAL_NO_TO
// FROM Grouped
// GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, grp
// ),
// CountPerGroup AS (
// SELECT 
//     BUNDLE_NO,
//     DENOMINATION,
//     SNO_MAIN,
//     SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS COUNT
// FROM Ranges
// GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN
// )
// SELECT 
// DENOMINATION,
// BUNDLE_NO,
// SNO_MAIN,
// COUNT
// FROM CountPerGroup
// ORDER BY BUNDLE_NO, DENOMINATION, SNO_MAIN`;


//             } else if (reqData.FROM_OFFICE){
//                 query = `WITH sr_codes AS (
// SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
// UNION
// SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
// )
// SELECT DISTINCT a.denomination, a.balance, a.sr_code, gg.sr_name
// FROM cca_stock_reg a
// JOIN sr_codes gg ON gg.code = TRIM(LEADING '0' FROM a.sr_code)
// WHERE a.stamp_code = 14
// AND TRIM(LEADING '0' FROM a.sr_code) = '${reqData.FROM_OFFICE}'
// AND a.denomination IN ('10', '20', '50', '100')`;} 
// if (query) {
// let response = await this.orDao.oDBQueryService(query);
// console.log(query);
// return response;
// } else {
// throw new Error("Required parameters are missing from reqData");
// }
// } catch (ex) {
// Logger.error("stampsServices - getbalancestampsforwithserail || Error :", ex);
// console.error("stampsServices - getbalancestampsforwithserail || Error :", ex);
// throw constructCARDError(ex);
// }
// }

getVendorBalancestockreport = async (reqData) => {
    try {
        let query = `SELECT DISTINCT
  a.denomination,
  a.balance,
  a.sr_code,(select ven_name from card.stamp_venlist i where i.LICENSE_NO=a.sr_code and rownum=1) as sr_name ,(select NAME FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as NAME,(select CATEGORY FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as CATEGORY,(select TYPE FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as TYPE
FROM cca_stock_reg a

WHERE a.stamp_code = '14' and 
  a.sr_code = '${reqData.FROM_OFFICE}'
  AND a.denomination IN ('10', '20', '50', '100')`;
  console.log(query,'bala');
  
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getVendorBalancestockreport || Error :", ex);
       console.error("stampsServices - getVendorBalancestockreport || Error :", ex);
       throw constructCARDError(ex);
    }
}
getBalanceSerilaStampsReport = async (reqData) => {
    try {
        let query;
        console.log(reqData.FROM_OFFICE.length,reqData.SR_CODE.length,'jhg');
        if (reqData.SR_CODE.length >= 3 && reqData.SR_CODE.length <= 4 ){
            query = `
            WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT DISTINCT
  a.denomination,
  a.balance,
 CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
  END as SR_CODE,(select NAME FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as NAME,(select CATEGORY FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as CATEGORY,(select TYPE FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code = '14'
  AND CASE
        WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
        ELSE a.sr_code
      END = '${reqData.SR_CODE}'
  AND a.denomination IN ('10', '20', '50', '100')`;
        } else if(reqData.SR_CODE.length === 1) {
            query = `
WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
),
valid_sr_codes AS (
  SELECT DISTINCT TRIM(LEADING '0' FROM sr_cd) AS code
  FROM sr_master
  WHERE dr_cd = '${reqData.FROM_OFFICE}'
)
 
SELECT DISTINCT
  a.denomination,
  a.balance,
  CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
    ELSE a.sr_code
  END AS SR_CODE,
  (SELECT NAME FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS NAME,
  (SELECT CATEGORY FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS CATEGORY,
  (SELECT TYPE FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code = '14'
  AND CASE
        WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
        ELSE a.sr_code
      END IN (SELECT code FROM valid_sr_codes)
  AND a.denomination IN ('10', '20', '50', '100')`;
        }
       
        else if(reqData.FROM_OFFICE.length <= 1) {
            query = `
            WITH sr_codes AS (
                SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name
                FROM sr_master
                UNION
                SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name
                FROM dr_master
              )
              SELECT DISTINCT
                a.denomination,
                a.balance,
                CASE
                  WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                  ELSE a.sr_code
                END as SR_CODE,
                (SELECT i.NAME FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as NAME,
                (SELECT i.CATEGORY FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as CATEGORY,
                (SELECT i.TYPE FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as TYPE,
                gg.sr_name
              FROM cca_stock_reg a
              JOIN sr_codes gg
                ON gg.code = CASE
                               WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                               ELSE a.sr_code
                             END
              WHERE a.stamp_code = '14'
                AND a.sr_code LIKE '%_%'      
                AND NOT REGEXP_LIKE(a.sr_code, '^[0-9]{3,4}$')
                AND a.denomination IN ('10', '20', '50', '100')`;
        } else if (reqData.FROM_OFFICE =='All') {
            query = ` WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name
  FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name
  FROM dr_master
)
SELECT DISTINCT
  a.denomination,
  a.balance,
  CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
    ELSE a.sr_code
  END as SR_CODE,
  (SELECT i.NAME FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as NAME,
  (SELECT i.CATEGORY FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as CATEGORY,
  (SELECT i.TYPE FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code = '14'
  AND  REGEXP_LIKE(a.sr_code, '^[0-9]{3,4}$')
  AND a.denomination IN ('10', '20', '50', '100')`;
        } else {
            query = `
            WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT DISTINCT
  a.denomination,
  a.balance,
 CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
  END as SR_CODE,(select NAME FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as NAME,(select CATEGORY FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as CATEGORY,(select TYPE FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code = '14'
  AND CASE
        WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
        ELSE a.sr_code
      END = '${reqData.FROM_OFFICE}'
  AND a.denomination IN ('10', '20', '50', '100')`;
        }
        console.log(query,'trtr');
       
        if (query) {
            let response = await this.orDao.oDBQueryService(query);
            console.log(query);
            return response;
        } else {
            throw new Error("Required parameters are missing from reqData");
        }
    } catch (ex) {
        Logger.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
        console.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
        throw constructCARDError(ex);
    }
}

// getBalanceSerilaStampsReport= async (reqData) => {
//     try {
//         let query = ` WITH sr_codes AS (
//   SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
//   UNION
//   SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
// )
// SELECT DISTINCT 
//   a.denomination, 
//   a.balance, 
//  CASE 
//     WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//                  ELSE a.sr_code 
//   END as SR_CODE,(select NAME FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as NAME,(select CATEGORY FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as CATEGORY,(select TYPE FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as TYPE,
//   gg.sr_name
// FROM cca_stock_reg a
// JOIN sr_codes gg 
//   ON gg.code = CASE 
//                  WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//                  ELSE a.sr_code 
//                END
// WHERE a.stamp_code = '14'
//   AND CASE 
//         WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//         ELSE a.sr_code 
//       END = '${reqData.FROM_OFFICE}'
//   AND a.denomination IN ('10', '20', '50', '100')`;
//   console.log(query,'bala');
  
//         let response = await this.orDao.oDBQueryService(query);
//         return response;
//     } catch (ex) {
//        Logger.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
//        console.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
//        throw constructCARDError(ex);
//     }
// }

getVendorBalanceSerilaStampsReport2= async (reqData) => {
    try {
        let query = `
 WITH CTE AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
        LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    FROM STAMP_MANAGER 
    WHERE  SR_CODE  = '${reqData.FROM_OFFICE}' 
        AND denomination = '${reqData.DENOMINATION}' 
),
Grouped AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    FROM CTE
),
Ranges AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SR_CODE,
        MIN(SERIAL_NO) AS SERIAL_NO_FROM,
        MAX(SERIAL_NO) AS SERIAL_NO_TO
    FROM Grouped
    GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SR_CODE, grp
),
CountPerGroup AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SR_CODE,
        SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS COUNT
    FROM Ranges
    GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SR_CODE
)
SELECT 
    (SELECT ven_name 
     FROM card.stamp_venlist i 
     WHERE i.LICENSE_NO = a.SR_CODE AND ROWNUM = 1) AS sr_name,
     SR_CODE,
    DENOMINATION,
    BUNDLE_NO,
    SNO_MAIN,
    COUNT
FROM CountPerGroup a
ORDER BY BUNDLE_NO, DENOMINATION, SNO_MAIN`;
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getVendorBalanceSerilaStampsReport2 || Error :", ex);
       console.error("stampsServices - getVendorBalanceSerilaStampsReport2 || Error :", ex);
       throw constructCARDError(ex);
    }
}
getVendorBalanceSerilaStampsReport3= async (reqData) => {
    try {
        let query = `
WITH CTE AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
        LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    FROM STAMP_MANAGER 
    WHERE 
        SR_CODE  = '${reqData.FROM_OFFICE}' 
        AND denomination = '${reqData.DENOMINATION}' 
        AND sno_main = '${reqData.SNO_MAIN}' 
        AND bundle_no = '${reqData.BUNDLE_NO}'
),
Grouped AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    FROM CTE
),
Ranges AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SR_CODE,
        MIN(SERIAL_NO) AS SERIAL_NO_FROM,
        MAX(SERIAL_NO) AS SERIAL_NO_TO
    FROM Grouped
    GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SR_CODE, grp
)
SELECT 
    (SELECT ven_name FROM card.stamp_venlist i WHERE i.LICENSE_NO = r.SR_CODE AND ROWNUM = 1) AS sr_name,
    r.SR_CODE,
    r.DENOMINATION,
    r.BUNDLE_NO,
    r.SNO_MAIN,
    r.SERIAL_NO_FROM, 
    r.SERIAL_NO_TO,
    r.SERIAL_NO_TO - r.SERIAL_NO_FROM + 1 AS COUNT
FROM Ranges r
ORDER BY r.BUNDLE_NO, r.DENOMINATION, r.SNO_MAIN, r.SERIAL_NO_FROM`;
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getVendorBalanceSerilaStampsReport3 || Error :", ex);
       console.error("stampsServices - getVendorBalanceSerilaStampsReport3 || Error :", ex);
       throw constructCARDError(ex);
    }
}
getBalanceSerilaStampsReport2= async (reqData) => {
    try {
        let query = `
WITH sr_codes AS (
    SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
    UNION
    SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
),
CTE AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
        LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    FROM STAMP_MANAGER 
    WHERE CASE 
            WHEN INSTR(SR_CODE, '_') = 0 THEN TRIM(LEADING '0' FROM SR_CODE) 
            ELSE SR_CODE 
        END = '${reqData.FROM_OFFICE}' 
        AND denomination = '${reqData.DENOMINATION}' 
       
),
Grouped AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    FROM CTE
),
Ranges AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SR_CODE,
        MIN(SERIAL_NO) AS SERIAL_NO_FROM,
        MAX(SERIAL_NO) AS SERIAL_NO_TO
    FROM Grouped
    GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SR_CODE, grp
),
CountPerGroup AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SR_CODE,
        SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS COUNT
    FROM Ranges
    GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SR_CODE
)
SELECT 
    gg.sr_name,
    CASE 
     WHEN INSTR(a.SR_CODE, '_') = 0 THEN TRIM(LEADING '0' FROM a.SR_CODE) 
                    ELSE a.SR_CODE 
    END AS SR_CODE,
    DENOMINATION,
    BUNDLE_NO,
    SNO_MAIN,
  
    COUNT
FROM CountPerGroup a
JOIN sr_codes gg ON gg.code = CASE 
                    WHEN INSTR(a.SR_CODE, '_') = 0 THEN TRIM(LEADING '0' FROM a.SR_CODE) 
                    ELSE a.SR_CODE 
                 END
ORDER BY BUNDLE_NO, DENOMINATION, SNO_MAIN`;
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getBalanceSerilaStampsReport2 || Error :", ex);
       console.error("stampsServices - getBalanceSerilaStampsReport2 || Error :", ex);
       throw constructCARDError(ex);
    }
}




getBalanceSerilaStampsReport3= async (reqData) => {
    try {
        let query = `
WITH sr_codes AS (
    SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
    UNION
    SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
),
CTE AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        LAG(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS PREV_SERIAL_NO,
        LEAD(SERIAL_NO) OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS NEXT_SERIAL_NO
    FROM STAMP_MANAGER 
     WHERE 
        CASE 
            WHEN INSTR(SR_CODE, '_') = 0 THEN TRIM(LEADING '0' FROM SR_CODE) 
            ELSE SR_CODE 
        END = '${reqData.FROM_OFFICE}' 
        AND denomination = '${reqData.DENOMINATION}' 
        AND sno_main = '${reqData.SNO_MAIN}' 
        AND bundle_no = '${reqData.BUNDLE_NO}'
),
Grouped AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SERIAL_NO,
        SR_CODE,
        SERIAL_NO - ROW_NUMBER() OVER (PARTITION BY BUNDLE_NO, DENOMINATION, SNO_MAIN ORDER BY SERIAL_NO) AS grp
    FROM CTE
),
Ranges AS (
    SELECT 
        BUNDLE_NO,
        DENOMINATION,
        SNO_MAIN,
        SR_CODE,
        MIN(SERIAL_NO) AS SERIAL_NO_FROM,
        MAX(SERIAL_NO) AS SERIAL_NO_TO
    FROM Grouped
    GROUP BY BUNDLE_NO, DENOMINATION, SNO_MAIN, SR_CODE, grp
)
SELECT 
    sc.sr_name,
    sc.code AS SR_CODE,
    r.DENOMINATION,
    r.BUNDLE_NO,
    r.SNO_MAIN,
    r.SERIAL_NO_FROM, 
    r.SERIAL_NO_TO,
    r.SERIAL_NO_TO - r.SERIAL_NO_FROM + 1 AS COUNT
   
FROM Ranges r
JOIN sr_codes sc 
    ON sc.code = CASE 
                    WHEN INSTR(r.SR_CODE, '_') = 0 THEN TRIM(LEADING '0' FROM r.SR_CODE) 
                    ELSE r.SR_CODE 
                 END
ORDER BY r.BUNDLE_NO, r.DENOMINATION, r.SNO_MAIN, r.SERIAL_NO_FROM`;
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getBalanceSerilaStampsReport3 || Error :", ex);
       console.error("stampsServices - getBalanceSerilaStampsReport3 || Error :", ex);
       throw constructCARDError(ex);
    }
}
//     getBalanceNONSerilaStampsReport = async (reqData) => {
//         try {
//             let query;
    
//             if(reqData.FROM_OFFICE &&  reqData.DENOMINATION) {
//                 query = ` WITH sr_codes AS (
//     SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
//     UNION
//     SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
// )
// SELECT 
//    CASE 
//      WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//                 ELSE a.sr_code 
//               END as sr_code,gg.sr_name,a.denomination,a.category,a.type,a.balance, 
//     (SELECT name FROM stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS NAME
    
// FROM 
//     CCA_STOCK_REG a
// JOIN 
//     sr_codes gg 
// ON 
//     gg.code = CASE 
//                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//                 ELSE a.sr_code 
//               END
// WHERE 
//     CASE 
//         WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//         ELSE a.sr_code 
//     END = '${reqData.FROM_OFFICE}' and a.denomination='${reqData.DENOMINATION}' AND not (a.stamp_code ='14' and a.denomination in ('10','20','50','100'))`;
//             } else if (reqData.FROM_OFFICE) {
//                 query = ` WITH sr_codes AS (
//     SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
//     UNION
//     SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
// )
// SELECT 
//    CASE 
//      WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//                 ELSE a.sr_code 
//               END as sr_code,gg.sr_name,a.denomination,a.category,a.type,a.balance, 
//     (SELECT name FROM stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS NAME
    
// FROM 
//     CCA_STOCK_REG a
// JOIN 
//     sr_codes gg 
// ON 
//     gg.code = CASE 
//                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//                 ELSE a.sr_code 
//               END
// WHERE 
//     CASE 
//         WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) 
//         ELSE a.sr_code 
//     END = '${reqData.FROM_OFFICE}' and not (a.stamp_code ='14' and a.denomination in ('10','20','50','100'))`;
//             } 
//             if (query) {
//                 let response = await this.orDao.oDBQueryService(query);
//                 console.log(query);
//                 return response;
//             } else {
//                 throw new Error("Required parameters are missing from reqData");
//             }
//         } catch (ex) {
//             Logger.error("stampsServices - getBalanceNONSerilaStampsReport || Error :", ex);
//             console.error("stampsServices - getBalanceNONSerilaStampsReport || Error :", ex);
//             throw constructCARDError(ex);
//         }
//     }

getBalanceNONSerilaStampsReport = async (reqData) => {
    try {
        let query;
        console.log(reqData.FROM_OFFICE.length,reqData.SR_CODE.length,'jhg');
        if (reqData && reqData.SR_CODE.length >= 3 && reqData.SR_CODE.length <= 4 ){
            query = `
            WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT DISTINCT
  a.denomination,
  a.balance,
 CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
  END as SR_CODE,(select NAME FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as NAME,(select CATEGORY FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as CATEGORY,(select TYPE FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code not in '14'
  AND CASE
        WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
        ELSE a.sr_code
      END = '${reqData.SR_CODE}' ORDER BY NAME, a.denomination`;
        } else if(reqData.SR_CODE.length === 1) {
            query = `
WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
),
valid_sr_codes AS (
  SELECT DISTINCT TRIM(LEADING '0' FROM sr_cd) AS code
  FROM sr_master
  WHERE dr_cd = '${reqData.FROM_OFFICE}'
)
 
SELECT DISTINCT
  a.denomination,
  a.balance,
  CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
    ELSE a.sr_code
  END AS SR_CODE,
  (SELECT NAME FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS NAME,
  (SELECT CATEGORY FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS CATEGORY,
  (SELECT TYPE FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code not in '14'
  AND CASE
        WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
        ELSE a.sr_code
      END IN (SELECT code FROM valid_sr_codes) ORDER BY NAME, a.denomination`;
        }
       
        else if(reqData.FROM_OFFICE.length <= 1) {
            query = `
            WITH sr_codes AS (
                SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name
                FROM sr_master
                UNION
                SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name
                FROM dr_master
              )
              SELECT DISTINCT
                a.denomination,
                a.balance,
                CASE
                  WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                  ELSE a.sr_code
                END as SR_CODE,
                (SELECT i.NAME FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as NAME,
                (SELECT i.CATEGORY FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as CATEGORY,
                (SELECT i.TYPE FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as TYPE,
                gg.sr_name
              FROM cca_stock_reg a
              JOIN sr_codes gg
                ON gg.code = CASE
                               WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                               ELSE a.sr_code
                             END
              WHERE a.stamp_code not in '14'
                AND a.sr_code LIKE '%_%'      
                AND NOT REGEXP_LIKE(a.sr_code, '^[0-9]{3,4}$') ORDER BY NAME, a.denomination`;
        } else if (reqData.FROM_OFFICE =='All') {
            query = ` WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name
  FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name
  FROM dr_master
)
SELECT DISTINCT
  a.denomination,
  a.balance,
  CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
    ELSE a.sr_code
  END as SR_CODE,
  (SELECT i.NAME FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as NAME,
  (SELECT i.CATEGORY FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as CATEGORY,
  (SELECT i.TYPE FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) as TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code not in '14'
  AND  REGEXP_LIKE(a.sr_code, '^[0-9]{3,4}$') ORDER BY NAME, a.denomination`;
        } else {
            query = `
            WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT DISTINCT
  a.denomination,
  a.balance,
 CASE
    WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
  END as SR_CODE,(select NAME FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as NAME,(select CATEGORY FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as CATEGORY,(select TYPE FROM card.stamp_name i where i.code=a.stamp_code and rownum=1) as TYPE,
  gg.sr_name
FROM cca_stock_reg a
JOIN sr_codes gg
  ON gg.code = CASE
                 WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
                 ELSE a.sr_code
               END
WHERE a.stamp_code not in '14'
  AND CASE
        WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code)
        ELSE a.sr_code
      END = '${reqData.FROM_OFFICE}' ORDER BY NAME, a.denomination`;
        }
        console.log(query,'trtr');
       
        if (query) {
            let response = await this.orDao.oDBQueryService(query);
            console.log(query);
            return response;
        } else {
            throw new Error("Required parameters are missing from reqData");
        }
    } catch (ex) {
        Logger.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
        console.error("stampsServices - getBalanceSerilaStampsReport || Error :", ex);
        throw constructCARDError(ex);
    }
}

    getBalanceSNOMAIN= async (reqData) => {
        try {
            let query = `SELECT DISTINCT  SNO_MAIN FROM STAMP_MANAGER WHERE SR_CODE='${reqData.FROM_OFFICE}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getBalanceSNOMAIN || Error :", ex);
           console.error("stampsServices - getBalanceSNOMAIN || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getBlockedStampsList= async (reqData) => {
        try {
            let query = `select a.*,(select name from stamp_name i where i.code=a.stamp_code  AND ROWNUM = 1)as name from srouser.cca_stock_reg_paid_block a WHERE CASE  WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) ELSE a.sr_code  END='${reqData.FROM_OFFICE}' and a.stamp_code not in ('14')`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getBlockedStampsList || Error :", ex);
           console.error("stampsServices - getBlockedStampsList || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    getBlockedStampsLists= async (reqData) => {
        try {
            let query = `select a.*,(select name from stamp_name i where i.code=a.stamp_code  AND ROWNUM = 1)as name from srouser.cca_stock_reg_paid_block a WHERE CASE  WHEN INSTR(a.sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM a.sr_code) ELSE a.sr_code  END='${reqData.FROM_OFFICE}' and a.stamp_code='14'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getBlockedStampsLists || Error :", ex);
           console.error("stampsServices - getBlockedStampsLists || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    UnblockSingleStamp = async (reqData) => {
        try {
            // Define the queries
            let query1 = `UPDATE srouser.cca_stock_reg_paid_block SET balance = balance - ${reqData.NUMBER} WHERE type = '${reqData.TYPE}' AND category = '${reqData.CATEGORY}' AND CASE  WHEN INSTR(sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM sr_code) ELSE sr_code  END  = '${reqData.FROM_OFFICE}' AND denomination = '${reqData.DENOMINATION}' AND STAMP_CODE='${reqData.STAMP_CODE}'`;
            let query2 = `UPDATE srouser.cca_stock_reg SET balance = balance + ${reqData.NUMBER} WHERE type = '${reqData.TYPE}' AND category = '${reqData.CATEGORY}' AND CASE  WHEN INSTR(sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM sr_code) ELSE sr_code  END  = '${reqData.FROM_OFFICE}' AND denomination = '${reqData.DENOMINATION}' AND STAMP_CODE='${reqData.STAMP_CODE}'`;
    
            // Execute the first query
            let response1 = await this.orDao.oDbUpdate(query1);

           
    
            // Check if query1 was successful
            if (response1) {
                // Execute the second query if the first one was successful
                let response2 = await this.orDao.oDbUpdate(query2);
              

                return response2;
            } else {
                // Handle the case where query1 did not succeed as expected
                throw new Error("Failed to update cca_stock_reg_paid_block.");
            }
        } catch (ex) {
            Logger.error("stampsServices - UnblockStamps || Error :", ex);
            console.error("stampsServices - UnblockStamps || Error :", ex);
            throw constructCARDError(ex);
        }
    };
    
    // UnblockStamps = async (reqData) => {
    //     try {
    //         // Define the queries
    //         let query1 = `UPDATE srouser.cca_stock_reg_paid_block SET balance = balance - ${reqData.NUMBER} WHERE type = '${reqData.TYPE}' AND category = '${reqData.CATEGORY}' AND CASE  WHEN INSTR(sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM sr_code) ELSE sr_code  END  = '${reqData.FROM_OFFICE}' AND denomination = '${reqData.DENOMINATION}' AND STAMP_CODE='${reqData.STAMP_CODE}'`;
    //         let query2 = `UPDATE srouser.cca_stock_reg SET balance = balance + ${reqData.NUMBER} WHERE type = '${reqData.TYPE}' AND category = '${reqData.CATEGORY}' AND CASE  WHEN INSTR(sr_code, '_') = 0 THEN TRIM(LEADING '0' FROM sr_code) ELSE sr_code  END  = '${reqData.FROM_OFFICE}' AND denomination = '${reqData.DENOMINATION}' AND STAMP_CODE='${reqData.STAMP_CODE}'`;
    
    //         // Execute the first query
    //         let response1 = await this.orDao.oDbUpdate(query1);
    
    //         // Check if query1 was successful
    //         if (response1) {
    //             // Execute the second query if the first one was successful
    //             let response2 = await this.orDao.oDbUpdate(query2);
    //             return response2;
    //         } else {
    //             // Handle the case where query1 did not succeed as expected
    //             throw new Error("Failed to update cca_stock_reg_paid_block.");
    //         }
    //     } catch (ex) {
    //         Logger.error("stampsServices - UnblockStamps || Error :", ex);
    //         console.error("stampsServices - UnblockStamps || Error :", ex);
    //         throw constructCARDError(ex);
    //     }
    // }
    VendorAvailableStampsCheckNew = async (reqData) =>{
        try {
            const receivedDate = this.escapeSqlValue(reqData.RECEIVED_DATE);
            const receivedBy = this.escapeSqlValue(reqData.RECEIVED_BY);
            const category = this.escapeSqlValue(reqData.CATEGORY);
            const type = this.escapeSqlValue(reqData.TYPE);
            const denomination = this.escapeSqlValue(reqData.DENOMINATION);
            const bundleNo = this.escapeSqlValue(reqData.BUNDLE_NO);
            const serialNoFromP = this.escapeSqlValue(reqData.SERIAL_NO_FROM_P);
            const serialNoToP = this.escapeSqlValue(reqData.SERIAL_NO_TO_P);
            const serialNoFrom = this.escapeSqlValue(reqData.SERIAL_NO_FROM);
            const serialNoTo = this.escapeSqlValue(reqData.SERIAL_NO_TO);
            const deliveredBy = this.escapeSqlValue(reqData.DELIVERED_BY);
            const toOffice = this.escapeSqlValue(reqData.TO_OFFICE);
            const fromOffice = this.escapeSqlValue(reqData.FROM_OFFICE);
            const snoMain = this.escapeSqlValue(reqData.SNO_MAIN);
            const indentNo = this.escapeSqlValue(reqData.INDENT_NO);
            const stampCode = this.escapeSqlValue(reqData.STAMP_CODE);
            const serialNo = this.escapeSqlValue(reqData.SERIAL_NO);


            let statusFunction = `WITH RequiredSerials AS (
    SELECT :serialNoFromP + LEVEL - 1 AS serial_no
    FROM DUAL
    CONNECT BY LEVEL <= :serialNoToP - :serialNoFromP + 1
),
SerialCheck AS (
    SELECT 
        r.serial_no,
        CASE 
            WHEN s.serial_no IS NOT NULL THEN 'Y' 
            ELSE 'N' 
        END AS status
    FROM 
        RequiredSerials r
    LEFT JOIN 
        stamp_manager s 
    ON 
        r.serial_no = s.serial_no
        AND s.denomination = :denomination
        AND s.bundle_no = :bundleNo
        AND s.category = :category
        AND s.type = :type
        AND s.sno_main = :snoMain
        AND s.sr_code = :toOffice
)
SELECT 
    CASE 
        WHEN COUNT(CASE WHEN status = 'N' THEN 1 END) > 0 THEN 'N' 
        ELSE 'Y' 
    END AS final_status
FROM 
    SerialCheck`;
    console.log(statusFunction,'status');
    
    const binds1 = {
        serialNoFromP: serialNoFromP,
        serialNoToP: serialNoToP,
        toOffice: toOffice,
        denomination: denomination,
        bundleNo: bundleNo,
        category: category,
        type: type,
        snoMain: snoMain
    };

    let statusFunctionres = await this.orDao.oDBQueryServicemis(statusFunction ,binds1);
    console.log(statusFunctionres);
    return statusFunctionres;
    
    // if (statusFunctionres[0].FINAL_STATUS === 'N') {
    //     const error = new Error('The Required Range Stamps Are not Available');
    //     error.statusCode = 200; 
    //     throw error;
    // }
} catch (ex) {
    Logger.error("stampsServices - VendorAvailableStampsCheck || Error :", ex);
    console.error("stampsServices - VendorAvailableStampsCheck || Error :", ex);
    throw ex;  // Re-throw the error after logging it
}
}
        
VendorRevertBack = async (reqData) => {
        try {
            const receivedDate = this.escapeSqlValue(reqData.RECEIVED_DATE);
            const receivedBy = this.escapeSqlValue(reqData.RECEIVED_BY);
            const category = this.escapeSqlValue(reqData.CATEGORY);
            const type = this.escapeSqlValue(reqData.TYPE);
            const denomination = this.escapeSqlValue(reqData.DENOMINATION);
            const bundleNo = this.escapeSqlValue(reqData.BUNDLE_NO);
            const serialNoFromP = this.escapeSqlValue(reqData.SERIAL_NO_FROM_P);
            const serialNoToP = this.escapeSqlValue(reqData.SERIAL_NO_TO_P);
            const serialNoFrom = this.escapeSqlValue(reqData.SERIAL_NO_FROM);
            const serialNoTo = this.escapeSqlValue(reqData.SERIAL_NO_TO);
            const deliveredBy = this.escapeSqlValue(reqData.DELIVERED_BY);
            const toOffice = this.escapeSqlValue(reqData.TO_OFFICE);
            const fromOffice = this.escapeSqlValue(reqData.FROM_OFFICE);
            const snoMain = this.escapeSqlValue(reqData.SNO_MAIN);
            const indentNo = this.escapeSqlValue(reqData.INDENT_NO);
            const stampCode = this.escapeSqlValue(reqData.STAMP_CODE);
            const serialNo = this.escapeSqlValue(reqData.SERIAL_NO);
            const procedureQuery = `DECLARE
                                     stat VARCHAR2(30);
                                 BEGIN
                                     srouser.stamps_surrender(
                                         TO_DATE('${receivedDate}', 'DD/MM/YYYY'),
                                         '${toOffice}',
                                         ${category},
                                         ${type},
                                         ${denomination},
                                         '${bundleNo}',
                                         ${serialNoFromP},
                                         ${serialNoToP},
                                         ${serialNoFrom},
                                         ${serialNoTo},
                                         '${deliveredBy}',
                                         '${toOffice}',
                                         LPAD('${fromOffice}',4,'0'),
                                         sysdate,
                                         '${snoMain}',
                                         ${indentNo},
                                         ${stampCode},
                                         ${serialNo},
                                         stat
                                     );
                                 END;`;
            // Execute the procedure
           let respo = await this.orDao.oDbUpdate(procedureQuery);
            console.log(procedureQuery);
            console.log(respo ,'5656');
                        let deleteQuery = `DELETE FROM srouser.dist_stock_reg_sno
                               WHERE RECEIVED_DATE = TO_DATE('${receivedDate}', 'DD/MM/YYYY')
                                 AND TO_OFFICE = '${toOffice}'
                                 AND DENOMINATION = ${denomination}
                                 AND BUNDLE_NO = '${bundleNo}'
                                 AND SNO_MAIN = '${snoMain}'
                                 AND FROM_OFFICE = LPAD('${fromOffice}',4,'0')
                                 AND STAMP_CODE = '${stampCode}'
                                 AND SERIAL_NO_FROM = '${serialNoFromP}'
                                 AND SERIAL_NO_TO = '${serialNoToP}'`;
                                 console.log(deleteQuery,'deletequery');
            let deleteResponse1 = await this.orDao.oDbDelete(deleteQuery);
            console.log(deleteResponse1);
     if(deleteResponse1 < 0){
        throw new Error(`Failed to delete partial record`);
    }
            const deleteQuery1 = `
            DELETE FROM STAMP_MANAGER 
            WHERE DENOMINATION = '${denomination}'
            AND BUNDLE_NO = '${bundleNo}'
            AND CATEGORY = '${category}'
            AND SNO_MAIN = '${snoMain}'
            AND SR_CODE = '${toOffice}'
            AND SERIAL_NO BETWEEN '${serialNoFromP}' AND '${serialNoToP}'`;
        console.log(deleteQuery1,'del');
        const deleteResponse = await this.orDao.oDbDelete(deleteQuery1, [], { autoCommit: true });
        // if (deleteResponse <= 0) {
        //     throw new Error(`Failed to delete records for ${fromOffice}, ${denomination}, ${bundleNo}`);
        // }
        // Insert serial numbers using PL/SQL block
        const serialStart = parseInt(serialNoFromP, 10);
        const serialEnd = parseInt(serialNoToP, 10);
        const sql = `
            BEGIN
                FOR i IN :start .. :end LOOP
                    INSERT INTO stamp_manager (SR_CODE, DENOMINATION, BUNDLE_NO, CATEGORY, TYPE, SNO_MAIN, SERIAL_NO, TIME_STAMP) 
                    VALUES ( LPAD(:srCode, 4, '0'), :denomination, :bundleNo, :category, :type, :snoMain, i, SYSDATE);
                END LOOP;
            END;
        `;
        console.log(sql,'sql');
        const binds = {
            start: serialStart,
            end: serialEnd,
            srCode: fromOffice,
            denomination: denomination,
            bundleNo: bundleNo,
            category: category,
            type: type,
            snoMain: snoMain
        };
        console.log('PL/SQL Insert Statement:', sql);
        console.log('PL/SQL Bind Variables:', binds);
        const insertResponse = await this.orDao.oDbInsertDocsWithBindParams(sql, binds, { autoCommit: true });
        if (insertResponse <= 0) {
            throw new Error(`Failed to insert serial numbers for ${toOffice}, ${denomination}, ${bundleNo}`);
        }
        return deleteResponse;
    } catch (ex) {
        Logger.error("stampsServices - VendorRevertBack || Error :", ex);
        console.error("stampsServices - VendorRevertBack || Error :", ex);
        throw ex; 
    }
}
    partialRevertBack = async (reqData) => {
        try {
            // Construct and execute the query for the stored procedure
            const receivedDate = this.escapeSqlValue(reqData.RECEIVED_DATE);
            const receivedBy = this.escapeSqlValue(reqData.RECEIVED_BY);
            const category = this.escapeSqlValue(reqData.CATEGORY);
            const type = this.escapeSqlValue(reqData.TYPE);
            const denomination = this.escapeSqlValue(reqData.DENOMINATION);
            const bundleNo = this.escapeSqlValue(reqData.BUNDLE_NO);
            const serialNoFromP = this.escapeSqlValue(reqData.SERIAL_NO_FROM_P);
            const serialNoToP = this.escapeSqlValue(reqData.SERIAL_NO_TO_P);
            const serialNoFrom = this.escapeSqlValue(reqData.SERIAL_NO_FROM);
            const serialNoTo = this.escapeSqlValue(reqData.SERIAL_NO_TO);
            const deliveredBy = this.escapeSqlValue(reqData.DELIVERED_BY);
            const toOffice = this.escapeSqlValue(reqData.TO_OFFICE);
            const fromOffice = this.escapeSqlValue(reqData.FROM_OFFICE);
            const snoMain = this.escapeSqlValue(reqData.SNO_MAIN);
            const indentNo = this.escapeSqlValue(reqData.INDENT_NO);
            const stampCode = this.escapeSqlValue(reqData.STAMP_CODE);
            const serialNo = this.escapeSqlValue(reqData.SERIAL_NO);


            let statusFunction = `WITH RequiredSerials AS (
    SELECT :serialNoFromP + LEVEL - 1 AS serial_no
    FROM DUAL
    CONNECT BY LEVEL <= :serialNoToP - :serialNoFromP + 1
),
SerialCheck AS (
    SELECT 
        r.serial_no,
        CASE 
            WHEN s.serial_no IS NOT NULL THEN 'Y' 
            ELSE 'N' 
        END AS status
    FROM 
        RequiredSerials r
    LEFT JOIN 
        stamp_manager s 
    ON 
        r.serial_no = s.serial_no
        AND s.denomination = :denomination
        AND s.bundle_no = :bundleNo
        AND s.category = :category
        AND s.type = :type
        AND s.sno_main = :snoMain
        AND s.sr_code = :toOffice
)
SELECT 
    CASE 
        WHEN COUNT(CASE WHEN status = 'N' THEN 1 END) > 0 THEN 'N' 
        ELSE 'Y' 
    END AS final_status
FROM 
    SerialCheck`;
    const binds1 = {
        serialNoFromP: serialNoFromP,
        serialNoToP: serialNoToP,
        toOffice: toOffice,
        denomination: denomination,
        bundleNo: bundleNo,
        category: category,
        type: type,
        snoMain: snoMain
    };

    let statusFunctionres = await this.orDao.oDBQueryServicemis(statusFunction ,binds1);
    console.log(statusFunctionres);
    
    if (statusFunctionres[0].FINAL_STATUS === 'N') {
        const error = new Error('The Required Range Stamps Are not Available');
        error.statusCode = 200; 
        throw error;
    }
     
            const procedureQuery = `DECLARE
                                     stat VARCHAR2(30);
                                 BEGIN
                                     srouser.stamps_surrender(
                                         TO_DATE('${receivedDate}', 'DD/MM/YYYY'),
                                         '${receivedBy}',
                                         ${category},
                                         ${type},
                                         ${denomination},
                                         '${bundleNo}',
                                         ${serialNoFromP},
                                         ${serialNoToP},
                                         ${serialNoFrom},
                                         ${serialNoTo},
                                         '${deliveredBy}',
                                         '${toOffice}',
                                         '${fromOffice}',
                                         sysdate,
                                         '${snoMain}',
                                         ${indentNo},
                                         ${stampCode},
                                         ${serialNo},
                                         stat
                                     );
                                 END;`;
     
            // Execute the procedure
           let respo = await this.orDao.oDbUpdate(procedureQuery);
            console.log(procedureQuery);
            console.log(respo ,'5656');
            
     
            // Construct and execute the delete query
            let deleteQuery = `DELETE FROM srouser.dist_stock_reg_sno
                               WHERE RECEIVED_DATE = TO_DATE('${receivedDate}', 'DD/MM/YYYY')
                                 AND TO_OFFICE = '${toOffice}'
                                 AND DENOMINATION = ${denomination}
                                 AND BUNDLE_NO = '${bundleNo}'
                                 AND SNO_MAIN = '${snoMain}'
                                 AND FROM_OFFICE = '${fromOffice}'
                                 AND STAMP_CODE = '${stampCode}'
                                 AND SERIAL_NO_FROM = '${serialNoFromP}'
                                 AND SERIAL_NO_TO = '${serialNoToP}'`;
     
            let deleteResponse1 = await this.orDao.oDbDelete(deleteQuery);
            console.log(deleteResponse1);
     if(deleteResponse1 < 0){
        throw new Error(`Failed to delete partial record`);
    }
            const deleteQuery1 = `
            DELETE FROM STAMP_MANAGER 
            WHERE DENOMINATION = '${denomination}'
            AND BUNDLE_NO = '${bundleNo}'
            AND CATEGORY = '${category}'
            AND SNO_MAIN = '${snoMain}'
            AND SR_CODE = LPAD('${toOffice}', 4, '0')
            AND SERIAL_NO BETWEEN '${serialNoFromP}' AND '${serialNoToP}'
        `;

        const deleteResponse = await this.orDao.oDbDelete(deleteQuery1, [], { autoCommit: true });

        if (deleteResponse <= 0) {
            throw new Error(`Failed to delete records for ${fromOffice}, ${denomination}, ${bundleNo}`);
        }

        // Insert serial numbers using PL/SQL block
        const serialStart = parseInt(serialNoFromP, 10);
        const serialEnd = parseInt(serialNoToP, 10);

        const sql = `
            BEGIN
                FOR i IN :start .. :end LOOP
                    INSERT INTO stamp_manager (SR_CODE, DENOMINATION, BUNDLE_NO, CATEGORY, TYPE, SNO_MAIN, SERIAL_NO, TIME_STAMP) 
                    VALUES ( LPAD(:srCode, 4, '0'), :denomination, :bundleNo, :category, :type, :snoMain, i, SYSDATE);
                END LOOP;
            END;
        `;

        const binds = {
            start: serialStart,
            end: serialEnd,
            srCode: fromOffice,
            denomination: denomination,
            bundleNo: bundleNo,
            category: category,
            type: type,
            snoMain: snoMain
        };

        console.log('PL/SQL Insert Statement:', sql);
        console.log('PL/SQL Bind Variables:', binds);

        const insertResponse = await this.orDao.oDbInsertDocsWithBindParams(sql, binds, { autoCommit: true });

        if (insertResponse <= 0) {
            throw new Error(`Failed to insert serial numbers for ${toOffice}, ${denomination}, ${bundleNo}`);
        }

        return deleteResponse;

    } catch (ex) {
        Logger.error("stampsServices - partialRevertBack || Error :", ex);
        console.error("stampsServices - partialRevertBack || Error :", ex);
        throw ex;  // Re-throw the error after logging it
    }
}
escapeSqlValue(value) {
    if (typeof value === 'string') {
        // Escape single quotes
        return value.replace(/'/g, "''");
    }
    return value;
}

 Checkdate = async (reqData) => {
    try {
        let responsequery = `SELECT DISTINCT sr_code, 
                denomination, 
                bundle_no, 
                category, 
                type, 
              TO_CHAR(trunc(time_stamp),'DD-MM-YYYY') AS formatted_time_stamp, 
                CASE 
                  WHEN TO_DATE('${reqData.RECEIVED_DATE}', 'DD-MM-YYYY') >= TO_DATE(TO_CHAR(time_stamp, 'DD-MM-YYYY'), 'DD-MM-YYYY')
                       AND TO_DATE('${reqData.RECEIVED_DATE}', 'DD-MM-YYYY') <= SYSDATE 
                  THEN 'Y' 
                  ELSE 'N' 
                END AS result
FROM stamp_manager
WHERE sr_code = LPAD('${reqData.FROM_OFFICE}', 4, '0')
  AND denomination = '${reqData.DENOMINATION}'
  AND bundle_no = '${reqData.BUNDLE_NO}'
  AND category = '${reqData.CATEGORY}'
  AND type = '${reqData.TYPE}'`;

       const  respo = await this.orDao.oDBQueryService(responsequery);
        console.log(responsequery);
        console.log(respo);

        if (respo.length === 0) {
            throw new Error('No records found.');
        }

        const result = respo[0];
        if (result.RESULT === 'N') {
            const formattedTimeStamp = (result.FORMATTED_TIME_STAMP);
            const currentDate = new Date().toLocaleDateString('en-GB');
            const errorMessage = `The selected Date should be between Stock received ${formattedTimeStamp} and ${currentDate}`;
            throw {
                statusCode: 200,
                success: false,
                message: errorMessage
            };
        }

        return respo;

    } catch (ex) {
        Logger.error("stampsServices - Checkdate || Error :", ex);
        console.error("stampsServices - Checkdate || Error :", ex);
        throw ex;
    }
}


//     partialRevertBack = async (reqData) => {
//         try {
//             // Construct and execute the query for the stored procedure
//             const receivedDate = this.escapeSqlValue(reqData.RECEIVED_DATE);
//             const receivedBy = this.escapeSqlValue(reqData.RECEIVED_BY);
//             const category = this.escapeSqlValue(reqData.CATEGORY);
//             const type = this.escapeSqlValue(reqData.TYPE);
//             const denomination = this.escapeSqlValue(reqData.DENOMINATION);
//             const bundleNo = this.escapeSqlValue(reqData.BUNDLE_NO);
//             const serialNoFromP = this.escapeSqlValue(reqData.SERIAL_NO_FROM_P);
//             const serialNoToP = this.escapeSqlValue(reqData.SERIAL_NO_TO_P);
//             const serialNoFrom = this.escapeSqlValue(reqData.SERIAL_NO_FROM);
//             const serialNoTo = this.escapeSqlValue(reqData.SERIAL_NO_TO);
//             const deliveredBy = this.escapeSqlValue(reqData.DELIVERED_BY);
//             const toOffice = this.escapeSqlValue(reqData.TO_OFFICE);
//             const fromOffice = this.escapeSqlValue(reqData.FROM_OFFICE);
//             const snoMain = this.escapeSqlValue(reqData.SNO_MAIN);
//             const indentNo = this.escapeSqlValue(reqData.INDENT_NO);
//             const stampCode = this.escapeSqlValue(reqData.STAMP_CODE);
//             const serialNo = this.escapeSqlValue(reqData.SERIAL_NO);
     
//             let procedureQuery = `DECLARE
//                                      stat VARCHAR2(30);
//                                  BEGIN
//                                      srouser.stamps_surrender(
//                                          TO_DATE('${receivedDate}', 'DD/MM/YYYY'),
//                                          '${receivedBy}',
//                                          ${category},
//                                          ${type},
//                                          ${denomination},
//                                          '${bundleNo}',
//                                          ${serialNoFromP},
//                                          ${serialNoToP},
//                                          ${serialNoFrom},
//                                          ${serialNoTo},
//                                          '${deliveredBy}',
//                                          '${toOffice}',
//                                          '${fromOffice}',
//                                          sysdate,
//                                          '${snoMain}',
//                                          ${indentNo},
//                                          ${stampCode},
//                                          ${serialNo},
//                                          stat
//                                      );
//                                  END;`;
     
//             // Execute the procedure
//             await this.orDao.oDbUpdate(procedureQuery);
     
//             // Construct and execute the delete query
//             let deleteQuery = `DELETE FROM srouser.dist_stock_reg_sno
//                                WHERE RECEIVED_DATE = TO_DATE('${receivedDate}', 'DD/MM/YYYY')
//                                  AND TO_OFFICE = '${toOffice}'
//                                  AND DENOMINATION = ${denomination}
//                                  AND BUNDLE_NO = '${bundleNo}'
//                                  AND SNO_MAIN = '${snoMain}'
//                                  AND FROM_OFFICE = '${fromOffice}'
//                                  AND STAMP_CODE = '${stampCode}'
//                                  AND SERIAL_NO_FROM = '${serialNoFromP}'
//                                  AND SERIAL_NO_TO = '${serialNoToP}'`;
     
//             let deleteResponse = await this.orDao.oDbDelete(deleteQuery);
//             return deleteResponse;            

//         } catch (ex) {
//             Logger.error("stampsServices - partialRevertBack || Error :", ex);
//             console.error("stampsServices - partialRevertBack || Error :", ex);
//             throw constructCARDError(ex);
//         }
//     }
     
//     // A utility function to escape SQL values
// escapeSqlValue(value) {
//     if (typeof value === 'string') {
//         // Escape single quotes
//         return value.replace(/'/g, "''");
//     }
//     return value;
// }


//------------------------- Related to Internal indent api's---------------------------------------------//

getFilledIndentRows= async (reqData) => {
    try {
        let query = `select a.*,(select empl_name from employee_login_master i where i.cfms_id=a.indent_raised_by and rownum=1) as Indent_raised,(select name from stamp_name i where i.code=a.stamp_code and rownum=1) as name,rowid from srouser.stamp_internal_indent a where a.sr_code='${reqData.FROM_OFFICE}' AND a.request_id='${reqData.REQUEST_ID}' and a.distribution_status='N'`;
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getFilledIndentRows || Error :", ex);
       console.error("stampsServices - getFilledIndentRows || Error :", ex);
       throw constructCARDError(ex);
    }
}
insertInternalIndentDetails = async (reqData) => {
    try {
        let query = `insert into srouser.stamp_internal_indent (sr_code,category,type,denomination,no_stamps,amount,indent_raised_by,indent_raised_date,request_id,stamp_code,distribution_status,to_office,indent_for) values ('${reqData.FROM_OFFICE}','${reqData.CATEGORY}','${reqData.TYPE}','${reqData.DENOMINATION}','${reqData.NUMBER}','${reqData.AMOUNT}','${reqData.RAISED_BY}',to_date('${reqData.INDENT_RAISED_DATE}','DD-MM-YYYY'),'${reqData.REQUEST_ID}','${reqData.STAMP_CODE}','N','${reqData.TO_OFFICE}','${reqData.INDNET_FOR}')`;
        let response = await this.orDao.oDbInsertDocs(query);
        return response;
    } catch (ex) {
        Logger.error("stampsServices - insertInternalIndentDetails || Error :", ex);
        console.error("stampsServices - insertInternalIndentDetails || Error :", ex);
        throw constructCARDError(ex);
    }
}
submitIndent = async (reqData) => {
    try {
        let query = `update srouser.stamp_internal_indent set distribution_status='R',INDENT_FOR='${reqData.TYPE}' where request_id='${reqData.REQUEST_ID}' and sr_code='${reqData.FROM_OFFICE}'`;
        let response = await this.orDao.oDbUpdate(query);
        return response;
    } catch (ex) {
        Logger.error("stampsServices - insertInternalIndentDetails || Error :", ex);
        console.error("stampsServices - insertInternalIndentDetails || Error :", ex);
        throw constructCARDError(ex);
    }
}
closeDistributedIndent = async (reqData) => {
    try {
        let query = `update srouser.stamp_internal_indent set distribution_status='Y' where request_id='${reqData.REQUEST_ID}' and to_office='${reqData.FROM_OFFICE}'`;
        let response = await this.orDao.oDbUpdate(query);
        return response;
    } catch (ex) {
        Logger.error("stampsServices - closeDistributedIndent || Error :", ex);
        console.error("stampsServices - closeDistributedIndent || Error :", ex);
        throw constructCARDError(ex);
    }
}
deleteRow = async (reqData) => {
    try {
        let query = `delete from srouser.stamp_internal_indent where request_id='${reqData.REQUEST_ID}' and sr_code='${reqData.FROM_OFFICE}' and rowid='${reqData.ROWID}'`;
        let response = await this.orDao.oDbDelete(query);
        return response;
    } catch (ex) {
        Logger.error("stampsServices - deleteRow || Error :", ex);
        console.error("stampsServices - deleteRow || Error :", ex);
        throw constructCARDError(ex);
    }
}
generateDocumentId = (sroCode) => {

    let hd = 'ST';
    let yr = new Date().getFullYear();
    yr = String(yr).substring(2, 4)
    if (String(sroCode).length === 3) {
        let srCode = "0" + String(sroCode);
        return hd + yr + "" + srCode + "" + Math.round(+new Date() / 1000)
    } else {
        return hd + yr + "" + sroCode + "" + Math.round(+new Date() / 1000)
    }
    // return "AP20221668621420609";
}
getDRcode= async (reqData) => {
    try {
        let query = `SELECT DR_CD FROM SR_MASTER WHERE SR_CD='${reqData.FROM_OFFICE}'`;
        let response = await this.orDao.oDBQueryService(query);
        return response;
    } catch (ex) {
       Logger.error("stampsServices - getDRcode || Error :", ex);
       console.error("stampsServices - getDRcode || Error :", ex);
       throw constructCARDError(ex);
    }
}


getInternalSerialIndent= async (reqData) => {
    try {
        let query;
        if (reqData.FROM_OFFICE && reqData.REQUEST_ID && reqData.INDENT_FOR) {
            query = `  WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT A.*, 
       (SELECT name 
        FROM stamp_name i 
        WHERE i.code = A.STAMP_CODE 
        AND ROWNUM = 1) AS name,
       sc.sr_name
FROM srouser.stamp_internal_indent A
LEFT JOIN sr_codes sc ON sc.code = A.sr_code
WHERE A.TO_OFFICE = '${reqData.FROM_OFFICE}'  
  and A.REQUEST_ID='${reqData.REQUEST_ID}'
  AND A.INDENT_FOR='${reqData.INDENT_FOR}'
  AND A.DISTRIBUTION_STATUS = 'R' 
  AND A.STAMP_CODE IN ('14')`;
        } else if (reqData.FROM_OFFICE && reqData.INDENT_FOR) {
            query = `WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT DISTINCT 
    A.REQUEST_ID,
    A.SR_CODE,
    sr_codes.sr_name,
    TO_CHAR(A.INDENT_RAISED_DATE, 'DD-MM-YYYY') AS RAISED_DATE,
    (SELECT EMPL_NAME 
     FROM EMPLOYEE_LOGIN_MASTER I 
     WHERE I.EMPL_ID = A.INDENT_RAISED_BY AND ROWNUM = 1) AS NAME
FROM 
    srouser.stamp_internal_indent A
LEFT JOIN 
    sr_codes ON A.SR_CODE = sr_codes.code
WHERE 
    A.TO_OFFICE = '${reqData.FROM_OFFICE}' AND INDENT_FOR='${reqData.INDENT_FOR}' and A.STAMP_CODE='14' AND A.DISTRIBUTION_STATUS='R' order by TO_DATE(RAISED_DATE ,'DD-MM-YYYY') DESC`;
        }

        if (query) {
            let response = await this.orDao.oDBQueryService(query);
            console.log(query);
            return response;
        } else {
            throw new Error("Required parameters are missing from reqData");
        }
    } catch (ex) {
        Logger.error("stampsServices - getInternalSerialIndent || Error :", ex);
        console.error("stampsServices - getInternalSerialIndent || Error :", ex);
        throw constructCARDError(ex);
    }
}

getInternalNONSerialIndent= async (reqData) => {
    try {
        let query;
        if (reqData.FROM_OFFICE && reqData.REQUEST_ID && reqData.INDENT_FOR) {
            query = ` WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT A.*, 
       (SELECT name 
        FROM stamp_name i 
        WHERE i.code = A.STAMP_CODE 
        AND ROWNUM = 1) AS name,
       sc.sr_name
FROM srouser.stamp_internal_indent A
LEFT JOIN sr_codes sc ON sc.code = A.sr_code
WHERE A.TO_OFFICE = '${reqData.FROM_OFFICE}'  
  and A.REQUEST_ID='${reqData.REQUEST_ID}'
  AND A.INDENT_FOR='${reqData.INDENT_FOR}'
  AND A.DISTRIBUTION_STATUS = 'R' 
  AND A.STAMP_CODE NOT IN ('14')`;
        } else if (reqData.FROM_OFFICE && reqData.INDENT_FOR) {
            query = `WITH sr_codes AS (
  SELECT CAST(sr_cd AS VARCHAR2(100)) AS code, sr_name FROM sr_master
  UNION
  SELECT CAST(dr_cd AS VARCHAR2(100)) AS code, dr_name AS sr_name FROM dr_master
)
SELECT DISTINCT 
    A.REQUEST_ID,
    A.SR_CODE,
    sr_codes.sr_name,
    TO_CHAR(A.INDENT_RAISED_DATE, 'DD-MM-YYYY') AS RAISED_DATE,
    (SELECT EMPL_NAME 
     FROM EMPLOYEE_LOGIN_MASTER I 
     WHERE I.EMPL_ID = A.INDENT_RAISED_BY AND ROWNUM = 1) AS NAME
FROM 
    srouser.stamp_internal_indent A
LEFT JOIN 
    sr_codes ON A.SR_CODE = sr_codes.code
WHERE 
    A.TO_OFFICE = '${reqData.FROM_OFFICE}' AND INDENT_FOR='${reqData.INDENT_FOR}' and A.STAMP_CODE not in ('14') AND A.DISTRIBUTION_STATUS='R' order by TO_DATE(RAISED_DATE ,'DD-MM-YYYY') DESC`;
        }

        if (query) {
            let response = await this.orDao.oDBQueryService(query);
            console.log(query);
            return response;
        } else {
            throw new Error("Required parameters are missing from reqData");
        }
    } catch (ex) {
        Logger.error("stampsServices - getInternalNONSerialIndent || Error :", ex);
        console.error("stampsServices - getInternalNONSerialIndent || Error :", ex);
        throw constructCARDError(ex);
    }
}


// generatePDFFromHTML = async (html) => {
//     const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//     const page = await browser.newPage();
//     await page.setContent(html);
//     const pdfBuffer = await page.pdf({
//         // format: 'Legal',
//         landscape: false,
//         margin: {
//             top: '20px',
//             right: '10px',
//             bottom: '30px',
//             left: '10px',
//         },
//     });
//     await browser.close();
//     return pdfBuffer;
// }
generatePDFFromHTML = async (html) => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    // Set HTML content and wait for network idle to ensure all resources are loaded
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 1500000 });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
        // format: 'Legal',
        landscape: false,
        margin: {
            top: '20px',
            right: '10px',
            bottom: '30px',
            left: '10px',
        },
        printBackground: true, // Ensure background colors/images are included
        timeout: 0 // Disable timeout to avoid large content errors
    });
    
    await browser.close();
    return pdfBuffer;
}


getPdfStampsPrint = async (reqData) => {
    try {
        let querycheck =`SELECT * 
FROM dist_stock_reg_sno 
WHERE indent_no = '${reqData.REQUEST_ID}' 
  AND from_office = LPAD('${reqData.FROM_OFFICE}', 4, '0') AND TRUNC(received_date) = TO_DATE('${reqData.DATE}', 'DD-MM-YYYY')` ;
        let response5 = await this.orDao.oDBQueryService(querycheck);
        console.log(response5,'check');
        if ((response5.length > 0 && !/^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$/.test(response5[0].RECEIVED_BY)) || response5.length === 0  ) {
let query=`WITH csi_single_row AS (
    SELECT 
        indent_no AS csi_indent_no,
        SR_CODE,
        PARTY_NAME,
        PARTY_RELATION,
        ADDRESS_1,
        FOR_WHOM,
        SALE_PARTY_RELATION,
        ADDRESS_2
    FROM 
        SROUSER.CCA_SALE_IND
    WHERE 
        indent_no = '${reqData.REQUEST_ID}'  
        AND SR_CODE = LPAD('${reqData.FROM_OFFICE}', 4, '0')  AND TRUNC(sdate) = TO_DATE('${reqData.DATE}', 'DD-MM-YYYY')
        AND  EXTRACT(YEAR FROM sdate) = EXTRACT(YEAR FROM SYSDATE)
        AND rownum = 1
),
serial_numbers AS (
    SELECT 
        dsr.indent_no,
        dsr.from_office,
        dsr.to_office,
        dsr.denomination,
        csi.csi_indent_no,
        csi.SR_CODE,
        csi.PARTY_NAME,
        csi.PARTY_RELATION,
        csi.ADDRESS_1,
        csi.FOR_WHOM,
        csi.SALE_PARTY_RELATION,
        csi.ADDRESS_2,
        dsr.SNO_MAIN,
        dsr.serial_no_from,
        dsr.serial_no_to,
        dsr.time_stamp
    FROM 
        dist_stock_reg_sno dsr
    LEFT JOIN 
        csi_single_row csi
    ON 
        dsr.from_office = csi.SR_CODE 
        AND dsr.indent_no = csi.csi_indent_no
    WHERE 
        dsr.indent_no IS NOT NULL 
        AND dsr.from_office = LPAD('${reqData.FROM_OFFICE}', 4, '0')
        AND dsr.indent_no = '${reqData.REQUEST_ID}' AND TRUNC(dsr.received_date) = TO_DATE('${reqData.DATE}', 'DD-MM-YYYY')
        AND  EXTRACT(YEAR FROM time_stamp) = EXTRACT(YEAR FROM SYSDATE)
),
generated_serials AS (
    SELECT
        indent_no,
        from_office,
        to_office,
        denomination,
        csi_indent_no,
        SR_CODE,
        PARTY_NAME,
        PARTY_RELATION,
        ADDRESS_1,
        FOR_WHOM,
        SALE_PARTY_RELATION,
        ADDRESS_2,
        SNO_MAIN,
        serial_no_from + LEVEL - 1 AS serial_no_i,
        time_stamp
    FROM
        serial_numbers
    CONNECT BY 
        LEVEL <= (serial_no_to - serial_no_from + 1)
        AND PRIOR dbms_random.value IS NOT NULL
        AND PRIOR serial_no_from = serial_no_from
        AND PRIOR denomination = denomination
)
SELECT
    indent_no,
    from_office,
    to_office,
    denomination,
    csi_indent_no,
    SR_CODE,
    PARTY_NAME,
    PARTY_RELATION,
    ADDRESS_1,
    FOR_WHOM,
    SALE_PARTY_RELATION,
    ADDRESS_2,
    SNO_MAIN,
    serial_no_i,
    TO_CHAR(time_stamp, 'DD-MM-YYYY') AS TIME_STAMP
FROM
    generated_serials
ORDER BY
    indent_no,
    denomination,
    serial_no_i`;
        console.log(query);
        
        let response = await this.orDao.oDBQueryService(query);
        console.log(response,'tt');
        if (response.length > 0) {
           
      
        let sro =`select sr_name,sr_cd from sr_master where sr_cd=${reqData.FROM_OFFICE}`;
        let result = await this.orDao.oDBQueryService(sro);
        

        // Generate HTML for each row with page breaks
        let htmlPages = response.map((item, index) => `
<div style="margin: 10px; margin-top: 49%; page-break-after: always; width: 80%; margin-left: auto; margin-right: auto; font-size: 0.6em;">
                <div class="header">
                   <table style="width: 100%; border : 1px solid black ">
                       <thead>
                           <tr>
                               <th style="font-weight: bold; border-bottom: 1px solid black; text-align: start ">Date: ${item.TIME_STAMP}</th>
                                 <th style="font-weight: bold; border-bottom: 1px solid black; text-align: start">
                               <div>Denomination: ${item.DENOMINATION}</div>
                               </th>
                               <th style="font-weight: bold; border-bottom: 1px solid black; text-align: start">Stamp S.No: ${item.SNO_MAIN} ${item.SERIAL_NO_I}</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr key=${index}>
                           <td>
                                <div style="padding: 2px; font-weight: bold">Purchased By</div>
                               <div style="padding: 2px;">${item.PARTY_NAME}</div>
                                <div style="padding: 2px;">${item.PARTY_RELATION}</div>
                                <div style="padding: 2px;">${item.ADDRESS_1 ? item.ADDRESS_1:''}</div>


                               </td>
                               <td>
                               <div style="padding: 2px;font-weight: bold">For Whom</div>
                               <div style="padding: 2px;">${item.FOR_WHOM}</div>
                               <div style="padding: 2px;">${item.SALE_PARTY_RELATION ? item.SALE_PARTY_RELATION:" "}</div>
                              <div style="padding: 2px;">${item.ADDRESS_2 ? item.ADDRESS_2:' '}</div>

                               </td>
                               <td >
                               <div style="padding: 2px;">Sub Registrar</div>
                               <div style="padding: 2px;">Ex. Offico Stamp Vendor</div>
                               <div style="padding: 2px;">SRO:${result[0].SR_NAME}(${result[0].SR_CD})</div>

                               </td>
                           </tr>
                       </tbody>
                   </table>
                </div>
            </div>
        `).join('');

        const pdfBuffer = await this.generatePDFFromHTML(htmlPages);
        const base64Pdf = pdfBuffer.toString('base64');
        return base64Pdf ;
    } else {
        let error = new Error('The entered request Id number is not distributed.');
        error.statusCode = 200;
        throw error;
    }
} else {
    let error = new Error('The entered request Id number is not belongs to Citizen Distribution Indent.');
    error.statusCode = 200;
    throw error;
}


} catch (err) {
    console.error("stampsServices - generateDocument || Error:", err);
    throw err;
  }
}

vendorCreation = async (reqData) => {
    try {
        if (reqData.DR_CD) {

            const aadharCheckQuery = `
                SELECT VEN_ID FROM card.stamp_venlist 
                WHERE AADHAR='${reqData.AADHAR}'
            `;
            let aadharCheckResult = await this.orDao.oDBQueryService(aadharCheckQuery);

            if (aadharCheckResult.length > 0) {
                // AADHAR already exists, return the existing VEN_ID
                let existingVenId = aadharCheckResult[0].VEN_ID;
                let error = new Error(`Vendor ID already exist for this user: ${existingVenId}`);
                error.statusCode = 203;
                error.venId = existingVenId;
                throw error;
            }
            // Format SR_CD
            let sr_cd = reqData.SR_CD.padStart(4, '0');
            let formattedSRCD = `${sr_cd.slice(0, 2)}-${sr_cd.slice(2)}`;
            console.log(formattedSRCD,'sr');
            const querysro = `
            select dr_name from dr_master where dr_cd='${reqData.DR_CD}'`;
        let result1 = await this.orDao.oDBQueryService(querysro);
        console.log(result1,'list');
        console.log(querysro);
            // Get current year
            let year = new Date().getFullYear();
            // Check for existing VEN_IDs
            const checkQuery = `
                SELECT VEN_ID FROM card.stamp_venlist 
                WHERE SR_CD='${reqData.SR_CD}' 
                AND VEN_ID LIKE '${formattedSRCD}-%-${year}' 
                ORDER BY VEN_ID DESC
            `;
            let result = await this.orDao.oDBQueryService(checkQuery);
            console.log(result,'res');
            // Determine the next serial number
            let serialNumber = '001';
            if (result.length > 0) {
                let lastVenId = result[0].VEN_ID;
                let lastSerial = parseInt(lastVenId.split('-')[2], 10);
                serialNumber = String(lastSerial + 1).padStart(3, '0');
            }
console.log(serialNumber,'serialnumber');
            // Generate the new VEN_ID
            let venId = `${formattedSRCD}-${serialNumber}-${year}`;
            console.log(venId,'venid');
            // Insert the new record
            let query = `
                INSERT INTO card.stamp_venlist (REG_DT, VEN_NAME, LICENSE_NO, RES_ADDRESS, VEN_ADDRESS, MOBILE_NO, SR_CD, VEN_ID, DR_CD, AADHAR)  
                VALUES (
                    '${result1[0].DR_NAME}',
                    '${reqData.VEN_NAME}',
                     '${venId}',
                    '${reqData.RES_ADDRESS}',
                    '${reqData.VEN_ADDRESS}',
                    '${reqData.MOBILE_NO}',
                    '${reqData.SR_CD}',
                    '${venId}',
                    '${reqData.DR_CD}',
                    '${reqData.AADHAR}'
                ) 
            `;
            let response = await this.orDao.oDbInsertDocs(query);
        
            let quer2 =`select VEN_ID FROM card.stamp_venlist where dr_cd='${reqData.DR_CD}' and sr_cd='${reqData.SR_CD}' and ven_id='${venId}'`;
            let response1 = await this.orDao.oDBQueryService(quer2);

                return response1;
        }
    } catch (ex) {
        Logger.error("stampsServices - vendorCreation || Error :", ex);
        console.error("stampsServices - vendorCreation || Error :", ex);
        throw ex;
    }
}

    //-------MIS cash related to stamp indent------//

   
    
    stamptypelistsrvc = async (data) => {
        let sr_code;
        if (data.SR_CODE.toString().length <= 3) {
          sr_code = 0 + data.SR_CODE;
        }
        else { 
            sr_code = data.SR_CODE
        }
        try {
          let bindparam = { category: data.category };
          // const query = `select distinct name from stamp_name where category='${category}'`;
          const query = ` select distinct  b.name, b.category  from cca_stock_reg  a
        join stamp_name b on a.STAMP_CODE= b.code
        where sr_code =LPAD('${sr_code}', 4, '0') and b.Category ='${data.category}' and a.balance>0`;
          let response = await this.orDao.oDBQueryService(query, bindparam)
   
          return response;
        }
        catch (ex) {
          Logger.error("mastersServices - stamptypelistsrvc || Error :", ex);
          console.error("mastersServices - stamptypelistsrvc || Error :", ex);
          throw new PDEError(ex);
        }
      }
      denominationslistsrvc = async (data) => {
   
        let sr_code;
        if (data.SR_CODE.toString().length <= 3) {
          sr_code = 0 + data.SR_CODE;
        }
        else { 
            sr_code = data.SR_CODE
        }
        try {
          let bindparam = { stamp_type: data.stamp_type };
          // const query = `select DENOMINATION from stamp_name where NAME='${stamp_type}' order by DENOMINATION asc`;
          const query = `select distinct a.*, b.name, b.category  from cca_stock_reg  a
        join stamp_name b on a.STAMP_CODE= b.code
        where sr_code =LPAD('${sr_code}', 4, '0') and name='${data.stamp_type}' and a.balance > 0 order by a.denomination asc`;
          let response = await this.orDao.oDBQueryService(query, bindparam)
          return response;
        }
        catch (ex) {
          Logger.error("mastersServices - denominationslistsrvc || Error :", ex);
          console.error("mastersServices - denominationslistsrvc || Error :", ex);
          throw new PDEError(ex);
        }
      }
      getstampavailablelistsrvc = async (sr_code) => {
        if (sr_code.toString().length <= 3) {
          sr_code = 0 + sr_code;
        }
   
        try {
          let bindparam = { sr_code: sr_code };
          const query = `select distinct a.*, b.name from cca_stock_reg  a
        join stamp_name b on a.STAMP_CODE= b.code
        where sr_code =LPAD('${sr_code}', 4, '0') and  a.balance>0 order by b.name , a.denomination asc `;
          let response = await this.orDao.oDBQueryService(query, bindparam)
          return response;
        }
        catch (ex) {
          Logger.error("mastersServices - getstampavailablelistsrvc || Error :", ex);
          console.error("mastersServices - getstampavailablelistsrvc || Error :", ex);
          throw new PDEError(ex);
        }
      }
    
      getVenderlistforaadharseed = async (reqData) => {
        try {
            let query = `select VEN_NAME,LICENSE_NO from card.stamp_venlist WHERE SR_CD='${reqData.FROM_OFFICE}' AND (STATUS = 'Y' OR STATUS is null) and aadhar is  null`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
           Logger.error("stampsServices - getVenderlist || Error :", ex);
           console.error("stampsServices - getVenderlist || Error :", ex);
           throw constructCARDError(ex);
        }
    }
    vendorAadharUpdate = async (reqData) => {
        try {
            if (reqData.AADHAR) {
     
                const aadharCheckQuery = `
                  SELECT a.*,(select sr_name from sr_master i where i.sr_cd=a.sr_cd and rownum=1) as sr_name FROM card.stamp_venlist a
                    WHERE a.AADHAR='${reqData.AADHAR}'
                `;
                let aadharCheckResult = await this.orDao.oDBQueryService(aadharCheckQuery);
     
                if (aadharCheckResult.length > 0) {
                    // AADHAR already exists, return the existing VEN_ID
                    let existingVenId = aadharCheckResult[0].VEN_ID;
                    let existingVenname = aadharCheckResult[0].VEN_NAME;
                    let sr = aadharCheckResult[0].SR_NAME;
                    let srcd = aadharCheckResult[0].SR_CD;
                    let error = new Error(`Provided Aadhaar Number Already Exist for This Vendor: ${existingVenId}, ${existingVenname}`);
                    error.statusCode = 203;
                    error.venId = `${existingVenname}-[${existingVenId}] Under ${sr}-(${srcd})`;
                    throw error;
                }
                let query = `
                    update card.stamp_venlist set AADHAR='${reqData.AADHAR}' where sr_cd='${reqData.DR_CD}' and license_no='${reqData.SR_CD}'
                `;
                let response = await this.orDao.oDbInsertDocs(query);
           
                let quer2 =`select VEN_ID FROM card.stamp_venlist where sr_cd='${reqData.DR_CD}' and ven_id='${reqData.SR_CD}'`;
                let response1 = await this.orDao.oDBQueryService(quer2);
     
                    return response1;
            }
        } catch (ex) {
            Logger.error("stampsServices - vendorCreation || Error :", ex);
            console.error("stampsServices - vendorCreation || Error :", ex);
            throw ex;
        }
    }
     

    // ------- Abstarct report application's-------------------

  getSrSaleUnderDrReport = async (reqData) => {
    try {
      let query;

      if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE.includes("_") &&
        reqData.TO_OFFICE === "all"
      ) {
        query =`SELECT
            denomination,
            stamp_code,
            type,
            category,
            (SELECT name
             FROM card.stamp_name i
             WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
                  CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
            (SELECT sr_name
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS sr_name,
            (SELECT dr_cd
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS dr_cd,  -- Get the dr_cd
            SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
        FROM
            DIST_STOCK_REG_SNO a
        WHERE
            FROM_OFFICE IN (
                SELECT LPAD(TO_CHAR(sr_cd), 4, '0')
                FROM sr_master
                WHERE dr_cd IN ('${reqData.FROM_OFFICE}')
            )
            AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY')
            AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
        GROUP BY
            denomination,
            stamp_code,
            type,
            category,
            FROM_OFFICE

            union all
 SELECT
            denomination,
            stamp_code,
            type,
            category,
            (SELECT name
             FROM card.stamp_name i
             WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
                 CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
            (SELECT sr_name
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS sr_name,
            (SELECT dr_cd
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS dr_cd,  -- Get the dr_cd
            SUM(SERIAL_NO_TO) AS total_count
        FROM
            DIST_STOCK_REG a
        WHERE
            FROM_OFFICE IN (
                SELECT LPAD(TO_CHAR(sr_cd), 4, '0')
                FROM sr_master
                WHERE dr_cd IN ('${reqData.FROM_OFFICE}')
            )
            AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY')
            AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
        GROUP BY
            denomination,
            stamp_code,
            type,
            category,
            FROM_OFFICE
 ORDER BY
            SR_NAME,NAME,DENOMINATION
            `;
      } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE) {
        query =`SELECT
    denomination,
    stamp_code,
    (SELECT name FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
         CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
    (SELECT sr_name FROM sr_master k WHERE LPAD(k.sr_cd, 4, 0) = a.from_office AND ROWNUM = 1) AS sr_name,
    SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
FROM
    DIST_STOCK_REG_SNO a
WHERE
    FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
    AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
GROUP BY
    denomination, stamp_code, FROM_OFFICE

UNION ALL

SELECT
    denomination,
    stamp_code,
    (SELECT name FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
          CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
    (SELECT sr_name FROM sr_master k WHERE LPAD(k.sr_cd, 4, 0) = a.from_office AND ROWNUM = 1) AS sr_name,
    SUM(SERIAL_NO_TO) AS total_count
FROM
    DIST_STOCK_REG a
WHERE
    FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
    AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
GROUP BY
    denomination, stamp_code, FROM_OFFICE ORDER BY NAME,DENOMINATION`;
      }

      if (query) {
        console.log(query, "query");

        let response = await this.orDao.oDBQueryService(query);
        console.log(query);
        return response;
      } else {
        throw new Error("Required parameters are missing from reqData");
      }
    } catch (ex) {
      Logger.error("stampsServices - getSrSaleUnderDrReport || Error :", ex);
      console.error("stampsServices - getSrSaleUnderDrReport || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  generatePDFFromHTML1 = async (html) => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {
      const htmlWithFooter = `
                <html>
                    <head>
                        <style>
                            @page {
                                @bottom-right {
                                    content: "Page " counter(page);
                                    font-size: 12px; /* Change the font size as needed */
                                    margin: 5px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `;

      await page.setContent(htmlWithFooter, { waitUntil: "networkidle0" }); 
      const pdfBuffer = await page.pdf({
        landscape: false,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "30px",
          left: "10px",
        },
        displayHeaderFooter: true, 
        footerTemplate:
          '<div style="font-size: 12px; width: 100%; text-align: center; margin: -10px 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        timeout: 90000, 
      });

      return pdfBuffer;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error; 
    } finally {
      await browser.close();
    }
  };
  generatePDFFromHTML3 = async (html) => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {
      const htmlWithFooter = `
                <html>
                    <head>
                        <style>
                            @page {
                                @bottom-right {
                                    content: "Page " counter(page);
                                    font-size: 12px; /* Change the font size as needed */
                                    margin: 5px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `;

      await page.setContent(htmlWithFooter, { waitUntil: "networkidle0" }); 
      const pdfBuffer = await page.pdf({
        format: "Legal",
        landscape: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "30px",
          left: "10px",
        },
        displayHeaderFooter: true, 
        footerTemplate:
          '<div style="font-size: 12px; width: 100%; text-align: center; margin: -10px 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        timeout: 90000, // Increase the timeout to 90 seconds
      });

      return pdfBuffer;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error; 
    } finally {
      await browser.close();
    }
  };

  getSrSaleUnderDrReportPdf = async (reqData) => {
    let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
    let Imagedatapath = fsone.readFileSync(imagePath, { encoding: "base64" });

    const currentDate = new Date();
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-GB", options);
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
    try {
      let query;

      if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE.includes("_") &&
        reqData.TO_OFFICE === "all"
      ) {
        query = `
   SELECT
            denomination,
            stamp_code,
            type,
            category,
            (SELECT name
             FROM card.stamp_name i
             WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
                  CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
            (SELECT sr_name
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS sr_name,
            (SELECT dr_cd
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS dr_cd,  -- Get the dr_cd
            SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
        FROM
            DIST_STOCK_REG_SNO a
        WHERE
            FROM_OFFICE IN (
                SELECT LPAD(TO_CHAR(sr_cd), 4, '0')
                FROM sr_master
                WHERE dr_cd IN ('${reqData.FROM_OFFICE}')
            )
            AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY')
            AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
        GROUP BY
            denomination,
            stamp_code,
            type,
            category,
            FROM_OFFICE

            union all
 SELECT
            denomination,
            stamp_code,
            type,
            category,
            (SELECT name
             FROM card.stamp_name i
             WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
          CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
            (SELECT sr_name
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS sr_name,
            (SELECT dr_cd
             FROM sr_master k
             WHERE k.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0')) AND ROWNUM = 1) AS dr_cd,  -- Get the dr_cd
            SUM(SERIAL_NO_TO) AS total_count
        FROM
            DIST_STOCK_REG a
        WHERE
            FROM_OFFICE IN (
                SELECT LPAD(TO_CHAR(sr_cd), 4, '0')
                FROM sr_master
                WHERE dr_cd IN ('${reqData.FROM_OFFICE}')
            )
            AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY')
            AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
        GROUP BY
            denomination,
            stamp_code,
            type,
            category,
            FROM_OFFICE
 ORDER BY
            SR_NAME,NAME,DENOMINATION`;
      } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE) {
        query = `SELECT
    denomination,
    stamp_code,
    (SELECT name FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
  CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
    (SELECT sr_name FROM sr_master k WHERE LPAD(k.sr_cd, 4, 0) = a.from_office AND ROWNUM = 1) AS sr_name,
    SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
FROM
    DIST_STOCK_REG_SNO a
WHERE
    FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
    AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
GROUP BY
    denomination, stamp_code, FROM_OFFICE

UNION ALL

SELECT
    denomination,
    stamp_code,
    (SELECT name FROM card.stamp_name i WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE, 
       (SELECT sr_name FROM sr_master k WHERE LPAD(k.sr_cd, 4, 0) = a.from_office AND ROWNUM = 1) AS sr_name,
    SUM(SERIAL_NO_TO) AS total_count
FROM
    DIST_STOCK_REG a
WHERE
    FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
    AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
GROUP BY
    denomination, stamp_code, FROM_OFFICE ORDER BY NAME,DENOMINATION`;
      }

      if (query) {
        console.log(query, "query");

        let response = await this.orDao.oDBQueryService(query);
        // Define the HTML content inline
        const html = `<div style="text-align: center; margin:15px; margin-top:0 ">
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
              <tr><img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <h2 style="margin:0px; margin-top : 4px">GOVERNMENT OF ANDHRA PRADESH</h2>
             <h3 style="margin:0px; margin-top : 4px">Registration And Stamps Department</h3>
              <th colspan="8">
<h3 style="margin:0px; margin-top : 5px"><span style="color: red;">STAMPS ABSTRACT </span>REPORT from<span style="color: red;"> ${
          reqData.fromDate
        } </span>to <span style="color: red;"> ${reqData.toDate} </span> </h3>
			<h5 style="margin:0px"><span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>
			
              </th></tr>
				<tr style="font-size : 15px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Office Name</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Office Code</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Stamp Name</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Denomination</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">No Of Stamps</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Total (RS)</th>
				</tr>
			  </thead>
			  <tbody>
				${response
          .map(
            (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${
                        index + 1
                      }
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.SR_NAME ? item.SR_NAME : "-"}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.FROM_OFFICE ? item.FROM_OFFICE : ""}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.NAME ? item.NAME : "-"}
                      </td>        
                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DENOMINATION ? item.DENOMINATION : "-"}
                      </td>      
                       <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.TOTAL_COUNT ? item.TOTAL_COUNT : "-"}
                      </td>      
                       <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DENOMINATION * item.TOTAL_COUNT}
                      </td>      
                      </tr>`
          )
          .join("")}
          <tr>
    <td colspan="5" style="text-align: right; vertical-align: middle; border: 1px solid #000; padding: 2px;">
      <strong>Grand Total:</strong>
    </td>
    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;"><strong>
      ${response.reduce((sum, item) => sum + (item.TOTAL_COUNT || 0), 0)}</strong>
    </td>
    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;"><strong>
      ${response.reduce((sum, item) => sum + (item.DENOMINATION * item.TOTAL_COUNT || 0), 0)}</strong>
    </td>
  </tr>
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
        const pdfBuffer = await this.generatePDFFromHTML1(html);
        const base64Pdf = pdfBuffer.toString("base64");
        return { pdf: base64Pdf };
      } else {
        throw new Error("Required parameters are missing from reqData");
      }
    } catch (ex) {
      Logger.error("stamps - getSrSaleUnderDrReportPdf || Error :", ex);
      console.error("stamps - getSrSaleUnderDrReportPdf || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getSrSaleUnderNodalReportPdf = async (reqData) => {
    let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
    let Imagedatapath = fsone.readFileSync(imagePath, { encoding: "base64" });

    const currentDate = new Date();
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-GB", options);
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
    try {
      let query;

      if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE === 'Alll'
      ) {
        query = `  SELECT
        denomination,
        stamp_code,
        type,
        category,
     CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
    FROM DIST_STOCK_REG_SNO a
    WHERE
          FROM_OFFICE NOT LIKE '9999'
        AND LENGTH(FROM_OFFICE) IN (4)
       AND REGEXP_LIKE(FROM_OFFICE, '^\\d+$')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        
        UNION ALL
        
        SELECT
        denomination,
        stamp_code,
        type,
        category,
       CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE
          FROM_OFFICE NOT LIKE '9999'
        AND LENGTH(FROM_OFFICE) IN (4)
       AND REGEXP_LIKE(FROM_OFFICE, '^\\d+$')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        order by DR_NAME,NAME,DENOMINATION`;
      }

      else if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE.length >= 3 && 
        /^\d+$/.test(reqData.FROM_OFFICE)
      ) {
        query = ` SELECT 
        denomination,
        stamp_code,
        type,
        category,
       CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
    FROM DIST_STOCK_REG_SNO a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY 
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        
        UNION ALL
        
         SELECT 
        denomination,
        stamp_code,
        type,
        category,
     CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY 
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        ORDER BY NAME,DENOMINATION`;
      }
      else if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE.includes("_")
      ) {
        query = ` SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG_SNO a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN ('${reqData.FROM_OFFICE}')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN  ('${reqData.FROM_OFFICE}')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        
        UNION ALL
        
         SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN ('${reqData.FROM_OFFICE}')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN ('${reqData.FROM_OFFICE}')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        ORDER BY NAME,DENOMINATION`;
      } else if (reqData.fromDate && reqData.toDate) {
        query = ` SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG_SNO a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN (
'03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2', '05_1', '05_2',
'06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2', '10_1', '10_2', '11_1', 
'11_2', '12_1', '12_2', '13_1', '13_2')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN ('02_2', '03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2',
                            '05_1', '05_2', '06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2',
                            '10_1', '10_2', '11_1', '11_2', '12_1', '12_2', '13_1', '13_2')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        
        UNION ALL
        
         SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN (
'03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2', '05_1', '05_2',
'06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2', '10_1', '10_2', '11_1', 
'11_2', '12_1', '12_2', '13_1', '13_2')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN ('02_2', '03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2',
                            '05_1', '05_2', '06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2',
                            '10_1', '10_2', '11_1', '11_2', '12_1', '12_2', '13_1', '13_2')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        ORDER BY DR_NAME,NAME,DENOMINATION`;
       
      } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE) {
        query = ` SELECT
        denomination,
        stamp_code,
        type,
        category,
       CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS sr_name,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        
        UNION ALL
        
         SELECT
        denomination,
        stamp_code,
        type,
        category,
      CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS FROM_OFFICE,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS sr_name,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE`;
      }

      if (query) {
        console.log(query, "query");

        let response = await this.orDao.oDBQueryService(query);

        const html = `<div style="text-align: center; margin:15px; margin-top:0 ">
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
              <tr><img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <h2 style="margin:0px; margin-top : 4px">GOVERNMENT OF ANDHRA PRADESH</h2>
             <h3 style="margin:0px; margin-top : 4px">Registration And Stamps Department</h3>
              <th colspan="8">
<h3 style="margin:0px; margin-top : 5px"><span style="color: red;">STAMPS ABSTRACT</span> REPORT from<span style="color: red;"> ${
          reqData.fromDate
        } </span>to <span style="color: red;"> ${reqData.toDate} </span> </h3>
			<h5 style="margin:0px"><span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>
			
              </th></tr>
				<tr style="font-size : 15px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Office Name</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Office Code</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Stamp Name</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Denomination</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">No Of Stamps</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Total (RS)</th>
				</tr>
			  </thead>
			  <tbody>
				${response
          .map(
            (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${
                        index + 1
                      }
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DR_NAME ? item.DR_NAME : "-"}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DR_CD ? item.DR_CD : ""}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.NAME ? item.NAME : "-"}
                      </td>        
                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DENOMINATION ? item.DENOMINATION : "-"}
                      </td>      
                       <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.TOTAL_COUNT ? item.TOTAL_COUNT : "-"}
                      </td>      
                       <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DENOMINATION * item.TOTAL_COUNT}
                      </td>      
                      </tr>`
          )
          .join("")}
          <tr>
    <td colspan="5" style="text-align: right; vertical-align: middle; border: 1px solid #000; padding: 2px;">
      <strong>Grand Total:</strong>
    </td>
    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;"><strong>
      ${response.reduce((sum, item) => sum + (item.TOTAL_COUNT || 0), 0)}</strong>
    </td>
    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;"><strong>
      ${response.reduce((sum, item) => sum + (item.DENOMINATION * item.TOTAL_COUNT || 0), 0)}</strong>
    </td>
  </tr>
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
        const pdfBuffer = await this.generatePDFFromHTML1(html);
        const base64Pdf = pdfBuffer.toString("base64");
        return { pdf: base64Pdf };
      } else {
        throw new Error("Required parameters are missing from reqData");
      }
    } catch (ex) {
      Logger.error("stamps - getSrSaleUnderNodalReportPdf || Error :", ex);
      console.error("stamps - getSrSaleUnderNodalReportPdf || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getSrSaleUnderNodalReport = async (reqData) => {
    try {
      let query;
      if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE === 'Alll'
      ) {
        query = `  SELECT
        denomination,
        stamp_code,
        type,
        category,
      CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
    FROM DIST_STOCK_REG_SNO a
    WHERE
          FROM_OFFICE NOT LIKE '9999'
        AND LENGTH(FROM_OFFICE) IN (4)
       AND REGEXP_LIKE(FROM_OFFICE, '^\\d+$')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        
        UNION ALL
        
        SELECT
        denomination,
        stamp_code,
        type,
        category,
      CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE
          FROM_OFFICE NOT LIKE '9999'
        AND LENGTH(FROM_OFFICE) IN (4)
       AND REGEXP_LIKE(FROM_OFFICE, '^\\d+$')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        order by DR_NAME,NAME,DENOMINATION`;
      }

      else if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE.length >= 3 && 
        /^\d+$/.test(reqData.FROM_OFFICE)
      ) {
        query = ` SELECT 
        denomination,
        stamp_code,
        type,
        category,
       CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count
    FROM DIST_STOCK_REG_SNO a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD')
    GROUP BY 
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        
        UNION ALL
        
         SELECT 
        denomination,
        stamp_code,
        type,
        category,
      CASE
        WHEN INSTR(FROM_OFFICE, '_') = 0 THEN TRIM(LEADING '0' FROM FROM_OFFICE)
        ELSE FROM_OFFICE
    END AS DR_CD,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS DR_NAME,
        (SELECT dr_cd 
         FROM sr_master k 
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd1,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.FROM_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD')
    GROUP BY 
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        ORDER BY NAME,DENOMINATION`;
      }
      else if (
        reqData.fromDate &&
        reqData.toDate &&
        reqData.FROM_OFFICE.includes("_")
      ) {
        query = ` SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG_SNO a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN ('${reqData.FROM_OFFICE}')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN  ('${reqData.FROM_OFFICE}')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        
        UNION ALL
        
         SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN ('${reqData.FROM_OFFICE}')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN ('${reqData.FROM_OFFICE}')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        ORDER BY NAME,DENOMINATION`;
      } else if (reqData.fromDate && reqData.toDate) {
        query = ` SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO - SERIAL_NO_FROM + 1) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG_SNO a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN (
'03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2', '05_1', '05_2',
'06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2', '10_1', '10_2', '11_1', 
'11_2', '12_1', '12_2', '13_1', '13_2')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN ('02_2', '03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2',
                            '05_1', '05_2', '06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2',
                            '10_1', '10_2', '11_1', '11_2', '12_1', '12_2', '13_1', '13_2')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        
        UNION ALL
        
         SELECT 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        (SELECT name 
         FROM card.stamp_name i 
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        dr.dr_cd,  -- Get the dr_cd directly from the join
        dm.dr_name, -- Get the dr_name from dr_master
        SUM(a.SERIAL_NO_TO) AS total_count  -- Sum of SERIAL_NO_TO for the unique combinations
    FROM 
        DIST_STOCK_REG a
    JOIN 
        (SELECT sr_cd, dr_cd 
         FROM sr_master 
         WHERE dr_cd IN (
'03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2', '05_1', '05_2',
'06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2', '10_1', '10_2', '11_1', 
'11_2', '12_1', '12_2', '13_1', '13_2')) dr ON dr.sr_cd = TO_NUMBER(LPAD(a.from_office, 4, '0'))  -- Join to get dr_cd
    JOIN 
        dr_master dm ON dm.dr_cd = dr.dr_cd  -- Join to get dr_name based on dr_cd
    WHERE 
        a.FROM_OFFICE IN (
            SELECT LPAD(TO_CHAR(sr_cd), 4, '0') 
            FROM sr_master 
            WHERE dr_cd IN ('02_2', '03_3', '04_3', '01_1', '02_1', '03_1', '03_2', '04_1', '04_2',
                            '05_1', '05_2', '06_1', '06_2', '07_1', '07_2', '07_3', '08_2', '09_2',
                            '10_1', '10_2', '11_1', '11_2', '12_1', '12_2', '13_1', '13_2')
        )
        AND TRUNC(a.RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'YYYY-MM-DD') AND TO_DATE('${reqData.toDate}', 'YYYY-MM-DD') 
    GROUP BY 
        a.denomination,
        a.stamp_code,
        a.type,
        a.category,
        dr.dr_cd,
        dm.dr_name
        ORDER BY DR_NAME,NAME,DENOMINATION`;
       
      } else if (reqData.fromDate && reqData.toDate && reqData.TO_OFFICE) {
        query = ` SELECT
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS sr_name,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE
        
        UNION ALL
        
         SELECT
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE,
        (SELECT name
         FROM card.stamp_name i
         WHERE i.code = a.stamp_code AND ROWNUM = 1) AS name,
        (SELECT sr_name
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS sr_name,
        (SELECT dr_cd
         FROM sr_master k
         WHERE LPAD(k.sr_cd, 4, 0) = a.FROM_OFFICE AND ROWNUM = 1) AS dr_cd,
        SUM(SERIAL_NO_TO) AS total_count
    FROM DIST_STOCK_REG a
    WHERE 
        FROM_OFFICE = LPAD('${reqData.TO_OFFICE}', 4, '0')
        AND TRUNC(RECEIVED_DATE) BETWEEN TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY') AND TO_DATE('${reqData.toDate}', 'DD-MM-YYYY')
    GROUP BY
        denomination,
        stamp_code,
        type,
        category,
        FROM_OFFICE`;
      }
      if (query) {
        console.log(query, "query");

        let response = await this.orDao.oDBQueryService(query);
                return response;
      } else {
        throw new Error("Required parameters are missing from reqData");
      }
    } catch (ex) {
      Logger.error(
        "stampsServices - getSrSaleUnderNodalReportNonserial || Error :",
        ex
      );
      console.error(
        "stampsServices - getSrSaleUnderNodalReportNonserial || Error :",
        ex
      );
      throw constructCARDError(ex);
    }
  };
  getVerifyVENDERIndent = async (reqData) => {
    try {
      let query;

      if (reqData.FROM_OFFICE && reqData.REQUEST_ID) {
        query = `SELECT A.*,(select VEN_NAME  from card.stamp_venlist i where i.license_no=A.purchaser_name and rownum=1) AS VENDOR_NAME FROM SROUSER.STAMP_INDENT A WHERE SR_CODE='${reqData.FROM_OFFICE}' AND A.REQUEST_ID='${reqData.REQUEST_ID}' AND MAIN_STATUS='P' AND REGEXP_LIKE(PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')`;
      } else if (reqData.FROM_OFFICE) {
        query = `SELECT DISTINCT A.REQUEST_ID,A.STAMP_TYPE,(select VEN_NAME  from card.stamp_venlist i where i.license_no=A.purchaser_name and rownum=1) AS VENDOR_NAME FROM SROUSER.STAMP_INDENT A WHERE SR_CODE='${reqData.FROM_OFFICE}' AND MAIN_STATUS='P' AND REGEXP_LIKE(PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')`;
      }
      if (query) {
        let response = await this.orDao.oDBQueryService(query);
        console.log(query);
        return response;
      } else {
        throw new Error("Required parameters are missing from reqData");
      }
    } catch (ex) {
      Logger.error("stampsServices - getVerifyVENDERIndent || Error :", ex);
      console.error("stampsServices - getVerifyVENDERIndent || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  UpdateVendorIndentVerifyStatus = async (reqData) => {
    try {
      let query;
      let bindParams = {};
 
      if (reqData.FROM_OFFICE && reqData.REQUEST_ID && reqData.NO_STAMPS && reqData.AMOUNT && reqData.STATUS === 'N' && reqData.REJECT_REASON && reqData.DENOMINATION) {
        query = `
          UPDATE SROUSER.STAMP_INDENT
          SET NO_STAMPS = :noStamps,
              AMOUNT = :amount,
              PAYMENT_STATUS = :status,
              REJECT_REASON = :rejectReason
          WHERE REQUEST_ID = :requestId AND SR_CODE = :fromOffice AND DENOMINATION =:denomination
        `;
        bindParams = {
          noStamps: reqData.NO_STAMPS,
          rejectReason: reqData.REJECT_REASON,
          amount: reqData.AMOUNT,
          status: reqData.STATUS,
          requestId: reqData.REQUEST_ID,
          fromOffice: reqData.FROM_OFFICE,
          denomination: reqData.DENOMINATION,
 
        };
      } else if (reqData.FROM_OFFICE && reqData.REQUEST_ID && reqData.STATUS === 'R' && reqData.REJECT_REASON && reqData.DENOMINATION) {
        query = `
          UPDATE SROUSER.STAMP_INDENT
          SET PAYMENT_STATUS = :status,
              REJECT_REASON = :rejectReason
          WHERE REQUEST_ID = :requestId AND SR_CODE = :fromOffice AND DENOMINATION =:denomination
        `;
        bindParams = {
          status: reqData.STATUS,
          rejectReason: reqData.REJECT_REASON,
          requestId: reqData.REQUEST_ID,
          fromOffice: reqData.FROM_OFFICE,
          denomination: reqData.DENOMINATION,
 
        };
      } else if (reqData.FROM_OFFICE && reqData.REQUEST_ID && reqData.STATUS && reqData.DENOMINATION) {
        query = `
          UPDATE SROUSER.STAMP_INDENT
          SET PAYMENT_STATUS = :status
          WHERE REQUEST_ID = :requestId AND SR_CODE = :fromOffice AND DENOMINATION =:denomination
        `;
        bindParams = {
          status: reqData.STATUS,
          requestId: reqData.REQUEST_ID,
          fromOffice: reqData.FROM_OFFICE,
          denomination: reqData.DENOMINATION,
 
        };
      }
      let response = await this.orDao.oDbInsertDocsWithBindParams(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("stampsServices - UpdateVendorIndentVerifyStatus || Error :", ex);
      console.error("stampsServices - UpdateVendorIndentVerifyStatus || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  UpdateVendorIMainStatus = async (reqData) => {
    try {
      let selectQuery = `
        SELECT DENOMINATION
        FROM SROUSER.STAMP_INDENT
        WHERE REQUEST_ID = :requestId AND SR_CODE = :fromOffice AND PAYMENT_STATUS = 'P'
      `;
      let selectBindParams = {
        requestId: reqData.REQUEST_ID,
        fromOffice: reqData.FROM_OFFICE,
      };
  console.log(selectQuery,'selectquery')
      // Execute the SELECT query
      let pendingRecords = await this.orDao.oDBQueryServiceWithBindParams(selectQuery, selectBindParams);
  
      // If any rows are found, throw an error
      if (pendingRecords && pendingRecords.length > 0) {
        let pendingDenominations = pendingRecords.map(row => row.DENOMINATION).join(", ");
        throw new Error(`The ${pendingDenominations} denominations are still in pending status Please Accept/Edit/Reject them, then only you can proceed for save.`);
      }
  
      // Proceed with the UPDATE query
      let updateQuery = `
        UPDATE SROUSER.STAMP_INDENT
        SET MAIN_STATUS = :status
        WHERE REQUEST_ID = :requestId AND SR_CODE = :fromOffice
      `;
      console.log(selectQuery,'selectquery')

      let updateBindParams = {
        status: reqData.MAIN_STATUS,
        requestId: reqData.REQUEST_ID,
        fromOffice: reqData.FROM_OFFICE,
      };
  
      let response = await this.orDao.oDbInsertDocsWithBindParams(updateQuery, updateBindParams);
      return response;
    } catch (ex) {
      Logger.error("stampsServices - UpdateVendorIMainStatus || Error :", ex);
      console.error("stampsServices - UpdateVendorIMainStatus || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  

  //----------------------for vendor court fee labels distri---------------//
  
  getIndentFormVENDERNonSerial = async (reqData) => {
    try {
      let query;
      if (reqData.FROM_OFFICE && reqData.RECEIPT_NO) {
        query = `select A.*,NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH, TO_CHAR((select ENTRY_DATE from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1), 'DD-MM-YYYY') AS DDDATE  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y' AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}' AND A.MIS_RECEIPT_NO='${reqData.RECEIPT_NO}'`;
      } else if (reqData.FROM_OFFICE) {
        query = `select  DISTINCT A.MIS_RECEIPT_NO AS RECEIPT_NO,A.PURCHASER_NAME, NVL((select ECHALLAN_NO from cash_det i where i.C_RECEIPT_NO=A.MIS_RECEIPT_NO and i.DOCT_NO='999999' AND i.sr_code=A.sr_code AND ROWNUM=1),'CASH') AS CHALLAN_0R_CASH  from srouser.stamp_indent A WHERE A.PAYMENT_STATUS='Y'  AND (A.DISTRIBUTION_STATUS IS NULL OR A.DISTRIBUTION_STATUS ='N') AND A.SR_CODE='${reqData.FROM_OFFICE}' AND A.MIS_RECEIPT_NO IS NOT NULL AND  REGEXP_LIKE(A.PURCHASER_NAME, '^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$') AND NOT REGEXP_LIKE(A.PURCHASER_NAME, '[A-Za-z]') AND    ( A.STAMP_CODE =('2') AND A.denomination IN (1, 2, 4, 5,10,20,50,100))`;
      }
      if (query) {
        let response = await this.orDao.oDBQueryService(query);
        return response;
      } else {
        throw new Error("Required parameters are missing from reqData");
      }
    } catch (ex) {
      Logger.error("stampsServices - getIndentFormVENDERNonSerial || Error :",ex);
      console.error("stampsServices - getIndentFormVENDERNonSerial || Error :",ex);
      throw constructCARDError(ex);
    }
  };
  
  NodalDistriwithoutSForVendor = async (reqData) => {
    try {
      let response;
      let responseArray = [];
      let arrayData = reqData.stamps;
      for (let i = 0; i < arrayData.length; i++) {
        let query = ` INSERT INTO dist_stock_reg (RECEIVED_DATE, RECEIVED_BY, CATEGORY, TYPE, DENOMINATION, SERIAL_NO_TO, DELIVERED_BY, TO_OFFICE, FROM_OFFICE, TIME_STAMP, STAMP_CODE,INDENT_NO) values
                (TO_DATE('${arrayData[i].RECEIVED_DATE}', 'DD-MM-YYYY'),
                '${arrayData[i].RECEIVED_BY}',
				        '${arrayData[i].CATEGORY}',
				        '${arrayData[i].TYPE}',			
				        '${arrayData[i].DENOMINATION}',
				        '${arrayData[i].SERIAL_NO_TO}',
                '${arrayData[i].DELIVERED_BY}',
                 '${arrayData[i].TO_OFFICE}',
                 LPAD('${arrayData[i].FROM_OFFICE}', 4, '0'),
                 sysdate,
                '${arrayData[i].STAMP_CODE}',
                '${arrayData[i].INDENT_NO}')`;
                 responseArray.push(query);}
           response = await this.orDao.oDbInsertMultipleDocs(responseArray,"Nodal Entry register without serialno");
           return response;
    } catch (ex) {
      Logger.error("stampsServices - NodalStampsDistrbutioniwithoutSerialNo || Error :",ex);
      console.error("stampsServices - NodalStampsDistrbutioniwithoutSerialNo || Error :",ex);
      throw constructCARDError(ex);
    }
  };
  getStampNamesnVendor = async () => {
    try {
      let query = `select distinct name,code,old_code,category,type from stamp_name where serial_no='N' AND CODE IN '2' order by name`;
      let response = await this.orDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("stampsServices - getStampNamesnVendor || Error :", ex);
      console.error("stampsServices - getStampNamesnVendor || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  

  //------------------START-----------------------------------ESIGN SKIP PROCESS API'S 3 IG LOGIN--------------------------------------------------//

  getEsignSkipStatus = async () => {
    try {
      let query = `select*from srouser.esign_skip_state`;
      let response = await this.orDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("stampsServices - getEsignSkipStatus || Error :", ex);
      console.error("stampsServices - getEsignSkipStatus || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  SkipOrEnableEsign = async (reqData) => {
    try {
      let check1 =`select*from srouser.esign_skip_state`;
      let checkres = await this.orDao.oDBQueryService(check1);
      if (checkres.length >=1 ){
      let query = `update srouser.esign_skip_state set STATUS= : STATUS, SKIP_DATE = TO_DATE(:ACTIONDATE, 'DD-MM-YYYY'), TIME_STAMP= SYSDATE, ACTION_BY= :ACTION_TAKEN`;
      const bindParams ={
        STATUS:reqData.STATUS,
        ACTIONDATE:reqData.DATE,
        ACTION_TAKEN:reqData.ACTION_BY
      }
      let response = await this.orDao.oDbInsertDocsWithBindParams(query,bindParams);
      return response;
    } else {
        let Insertquery = `insert into srouser.esign_skip_state (STATUS,SKIP_DATE,ACTION_BY) values (:STATUS,TO_DATE(:ACTIONDATE, 'DD-MM-YYYY'),:ACTION)`;
        const bindParams ={
          STATUS:reqData.STATUS,
          ACTIONDATE:reqData.DATE,
          ACTION:reqData.ACTION_BY
        }
        let response1 = await this.orDao.oDbInsertDocsWithBindParams(Insertquery, bindParams);
        return response1;
      }
     
    } catch (ex) {
      Logger.error("stampsServices - SkipOrEnableEsign || Error :", ex);
      console.error("stampsServices - SkipOrEnableEsign || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  
  getEsignSkipStatusDoc = async (reqData) => {
    try {
      let query = `select*from srouser.esign_skip_state where trunc(skip_date) = to_date(sysdate,'DD-MM-YY') and status = 'Y'`;
      let response = await this.orDao.oDBQueryService(query);
      let result = 0;
      console.log(response);
      if(response.length > 0) {
        const query =  `update pde_doc_status_cr set doc_esign = 'Y' where sr_code = :SR_CODE and doct_no = : DOCT_NO and book_no  = :BOOK_NO and reg_year = :REG_YEAR`;
        const bindParams = {
          SR_CODE : reqData.SR_CODE,
          BOOK_NO : reqData.BOOK_NO,
          REG_YEAR :reqData.REG_YEAR,
          DOCT_NO : reqData.DOCT_NO
        }
        result = await this.orDao.oDbInsertDocsWithBindParams(query, bindParams);
      }
      console.log(result);
      return result;
    } catch (ex) {
      Logger.error("stampsServices - getEsignSkipStatusDoc || Error :", ex);
      console.error("stampsServices - getEsignSkipStatusDoc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

//------------------END-----------------------------------ESIGN SKIP PROCESS API'S 3 IG LOGIN--------------------------------------------------//


getDistStampsData = async (reqData) => {
  try {
    let query;
    let stampFilter = '';
    let bindParam = {};
    if (reqData.stampType === 'Non-Judicial') {
      stampFilter = `WHERE C.STAMP_CODE IN (6,7,8,9,11,12,13,14)`;
    } else if (reqData.stampType === 'Judicial') {
      stampFilter = `WHERE C.STAMP_CODE NOT IN (6,7,8,9,11,12,13,14)`;
    }

    query = `
      SELECT 
    dr.dr_code as dr_cd,
    dr.dr_name,
    NVL(sr.sr_wise_available, 0) AS sr_wise_available,
    NVL(dr_bal.dr_wise_available, 0) AS dr_wise_available
FROM 
    CARD.MST_REVREGDIST dr
LEFT JOIN (
    SELECT 
        d.dr_code as dr_cd, 
        SUM(CASE WHEN c.BALANCE <= 0 THEN 0 ELSE c.BALANCE END) AS sr_wise_available
    FROM 
        cca_stock_reg c 
    JOIN 
        sr_master s ON LPAD(TO_CHAR(s.sr_cd), 4, '0') = c.sr_code 
    JOIN 
        CARD.MST_REVREGDIST d ON d.dr_code = s.dr_cd 
       ${stampFilter}
    GROUP BY 
        d.dr_code
) sr ON sr.dr_cd = dr.dr_code
LEFT JOIN (
    SELECT 
        c.sr_code AS dr_cd, 
        SUM(CASE WHEN c.BALANCE <= 0 THEN 0 ELSE c.BALANCE END) AS dr_wise_available
    FROM 
        cca_stock_reg c 
       ${stampFilter}
    GROUP BY 
        c.sr_code
) dr_bal ON dr_bal.dr_cd = dr.dr_code
ORDER BY 
    dr.dr_name`;
    //const result = await this.orDaoRead.oDBQueryService(query, bindParam);
        const result = await this.orDao.oDBQueryServiceWithBindParams(query, bindParam);

    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw new Error(error.message);
  }
};

getSroStampsData = async (reqData) => {
  try {
    let query;
    let stampFilter = '';
    let bindParam ={}
    if (reqData.stampType === 'Non-Judicial') {
      stampFilter = `WHERE C.STAMP_CODE IN (6,7,8,9,11,12,13,14)`;
    } else if (reqData.stampType === 'Judicial') {
      stampFilter = `WHERE C.STAMP_CODE NOT IN (6,7,8,9,11,12,13,14)`;
    }

    if(reqData.DR_CD == 'SRO'){
      query = `
SELECT 
  c.sr_code, 
  s.sr_name, 
  d.dr_name AS dr_name,
  SUM(CASE WHEN c.BALANCE <= 0 THEN 0 ELSE c.BALANCE END) AS BALANCE
FROM cca_stock_reg c
JOIN sr_master s ON LPAD(TO_CHAR(s.sr_cd), 4, '0') = c.sr_code
JOIN dr_master d ON d.dr_cd = s.dr_cd
${stampFilter}
GROUP BY c.sr_code, s.sr_name, d.dr_name
ORDER BY sr_name
 `;
     }
   else if(reqData.DR_CD == 'DR'){
    query = `
    SELECT 
c.sr_code, 
d.dr_name AS sr_name, 
d.dr_name AS dr_name, 
SUM(CASE WHEN c.BALANCE <= 0 THEN 0 ELSE c.BALANCE END) AS BALANCE
FROM cca_stock_reg c
JOIN dr_master d ON d.dr_cd = c.sr_code
${stampFilter} 
GROUP BY c.sr_code, d.dr_name
ORDER BY d.dr_name
`;
   }
   else{
     bindParam = {
      DR_CD: reqData.DR_CD 
    };
    query = `
      SELECT 
  c.sr_code, 
  d.dr_name AS sr_name, 
  d.dr_name AS dr_name, 
  SUM(CASE WHEN c.BALANCE <= 0 THEN 0 ELSE c.BALANCE END) AS BALANCE
FROM cca_stock_reg c
JOIN dr_master d ON d.dr_cd = c.sr_code
${stampFilter} AND d.dr_cd = :DR_CD
GROUP BY c.sr_code, d.dr_name

UNION ALL

SELECT 
  c.sr_code, 
  s.sr_name, 
  d.dr_name AS dr_name,
  SUM(CASE WHEN c.BALANCE <= 0 THEN 0 ELSE c.BALANCE END) AS BALANCE
FROM cca_stock_reg c
JOIN sr_master s ON LPAD(TO_CHAR(s.sr_cd), 4, '0') = c.sr_code AND s.dr_cd = :DR_CD
JOIN dr_master d ON d.dr_cd = s.dr_cd
${stampFilter}
GROUP BY c.sr_code, s.sr_name, d.dr_name
ORDER BY sr_name
 `;
   }
    //const result = await this.orDaoRead.oDBQueryService(query, bindParam);
     const result = await this.orDao.oDBQueryServiceWithBindParams(query, bindParam);

    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw new Error(error.message);
  }
};

getStampsSrData = async (reqData) => {
  try {
    let stampFilter = '';
    let bindParam = {
      SR_code: reqData.SR_code
    };
    if (reqData.stampType === 'Non-Judicial') {
      stampFilter = `AND A.stamp_code IN (6,7,8,9,11,12,13,14)`;
    } else if (reqData.stampType === 'Judicial') {
      stampFilter = `AND A.stamp_code NOT IN (6,7,8,9,11,12,13,14)`;
    }

    const query = `
   select a.*,(select name from stamp_name i where i.code=a.stamp_code and rownum=1) as stamp_name from cca_stock_reg a where a.sr_code=:SR_code ${stampFilter} ORDER BY STAMP_NAME`;
    //const result = await this.orDaoRead.oDBQueryService(query, bindParam);
     const result = await this.orDao.oDBQueryServiceWithBindParams(query, bindParam);

    return result;

    
  } catch (error) {
    console.error("Error executing query:", error);
    throw new Error(error.message);
  }
};
  

getStampsDistDownload = async (reqBody) => {
    const { arrayData,type } = reqBody;
    try {
      const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: "base64" });
      const isSROAvailable = arrayData.some(item => item.SR_NAME);
      const uniqueDistricts = [...new Set(arrayData.map(item => item.DR_NAME))];
      const hasUnderscoreInSRCode = arrayData.some(item => item.DR_CD?.includes('_') ||item.SR_CODE?.includes('_'));
      const displayDistrict =
        uniqueDistricts.length === 1
          ? uniqueDistricts[0]
          : hasUnderscoreInSRCode
            ? 'ALL Districts'
            : 'All SROs';
      

      const districtHeader = isSROAvailable ? "SRO Name" : "District";

      // Calculate grand totals
      const totals = arrayData.reduce(
        (acc, item) => {
          if (item.BALANCE !== undefined) {
            acc.BALANCE += item.BALANCE;
          } else {
            const sr = item.SR_WISE_AVAILABLE ?? 0;
            const dr = item.DR_WISE_AVAILABLE ?? 0;
            acc.BALANCE += sr + dr;
          }
          return acc;
        },
        { BALANCE: 0 }
      );          
      const html = `
        <style>
          @page {
            margin: 40px 20px 60px 20px;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .header {
            text-align: center;
            margin: 20px;
            margin-top: 0;
          }
          .content {
            margin: 0 20px;
          }
          table {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 0;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            vertical-align: middle;
          }
          .total-row {
            font-weight: bold;
            background-color: #f0f0f0;
          }
          .page-break-avoid {
            page-break-inside: avoid;
          }
        </style>
        <div class="header">
          <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width: 75px;" /></div>
          <div style="margin: 0px; margin-top: 5px; font-size: 17px;">GOVERNMENT OF ANDHRA PRADESH</div>
          <div style="margin: 0px; margin-top: 5px; font-size: 16px;">REGISTRATIONS & STAMPS DEPARTMENT</div>
          <div style="margin: 0px; margin-top: 5px; text-decoration: underline; font-size: 17px; font-weight: 700;">${type} Stamps Stock-Report</div>
          <div style="display: flex; justify-content: space-between; margin-top: 20px; width: 100%; font-size: 14px;">
            <div style="flex-grow: 1; text-align: start;">
              <span style="font-weight: 700;">District Name</span>: 
              <span>${displayDistrict}</span>
            </div>
          </div>
        </div>

        <div class="content">
          <table>
            <thead>
              <tr style="font-size: 13px;">
                <th style="width: 5%;">S.No.</th>
                <th style="width: 25%; word-wrap: break-word;">${districtHeader}</th>
                <th style="width: 12%; word-wrap: break-word;">Available Stock</th>
              </tr>
            </thead>
            <tbody style="font-size: 12px;">
              ${arrayData
                .map(
                  (eachitem, index) => `
                    <tr class="page-break-avoid">
                      <td>${index + 1}</td>
                      <td style="word-wrap: break-word;">
                        ${eachitem.SR_NAME ? `${eachitem.SR_NAME} (${eachitem.SR_CODE})` : eachitem.DR_NAME}
                      </td>
                      <td>${eachitem.BALANCE !== undefined? eachitem.BALANCE : (eachitem.SR_WISE_AVAILABLE ?? 0) + (eachitem.DR_WISE_AVAILABLE ?? 0)}</td>
                    </tr>`
                )
                .join("")}
              <tr class="total-row">
                <td colspan="2">Grand Total</td>
                <td>${totals.BALANCE}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      
      const pdfBuffer = await generatePDFFromHTML(html, true);
      const base64Pdf = pdfBuffer.toString("base64");
      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("ReportServices - SROecOverallCountSrvc || Error :", ex);
      console.error("ReportServices - SROecOverallCountSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getStampsSrDownload = async (reqBody) => {
    const { arrayData, type = "", DR_NAME, SRO, SroCode } = reqBody;
    console.log(reqBody,'reqBodyreqBody');
    try {
      const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: "base64" });

      const isSROAvailable = arrayData.some(item => item.SR_NAME);
      const uniqueDistricts = [...new Set(arrayData.map(item => item.DR_NAME))];
      const displayDistrict = uniqueDistricts.length > 1
        ? (isSROAvailable ? 'All SROs' : 'ALL Districts')
        : uniqueDistricts[0] || 'ALL Districts';

      const districtHeader = isSROAvailable ? "SRO Name" : "District";

      // Calculate grand totals
      const totals = arrayData.reduce(
        (acc, item) => {
          acc.BALANCE += item.BALANCE || 0;
          return acc;
        },
        { BALANCE: 0 }
      );

      const html = `
        <style>
          @page {
            margin: 40px 20px 60px 20px;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .header {
            text-align: center;
            margin: 20px;
            margin-top: 0;
          }
          .content {
            margin: 0 20px;
          }
          table {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 0;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            vertical-align: middle;
          }
          .total-row {
            font-weight: bold;
            background-color: #f1f1f1;
          }
          .page-break-avoid {
            page-break-inside: avoid;
          }
        </style>
        <div class="header">
          <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width: 75px;" /></div>
          <div style="margin: 0px; margin-top: 5px; font-size: 17px;">GOVERNMENT OF ANDHRA PRADESH</div>
          <div style="margin: 0px; margin-top: 5px; font-size: 16px;">REGISTRATIONS & STAMPS DEPARTMENT</div>
          <div style="margin: 0px; margin-top: 5px; text-decoration: underline; font-size: 17px; font-weight: 700;">${type}-Stamps Stock Report</div>
          <div style="display: flex; justify-content: space-between; margin-top: 20px; width: 100%; font-size: 14px;">
            <div style="flex-grow: 1; text-align: start;">
              <span style="font-weight: 700;">SRO Name</span>: 
              <span>${SRO ?? '-'} - ${SroCode ?? '-'}</span>
            </div>
            <div style="flex-grow: 1; text-align: center;">
              <span style="font-weight: 700;">District Name</span>: 
              <span>${DR_NAME ?? '-'}</span>
            </div>
            <div style="flex-grow: 1; text-align: right;">
              ${districtHeader === 'SRO Name' && arrayData[0]?.DRNAME ? `<span style="font-weight: 700; margin-left: 10px;">District Name</span>: ${arrayData[0].DRNAME}` : ''}
            </div>
          </div>
        </div>

        <div class="content">
          <table>
            <thead>
              <tr style="font-size: 13px;">
                <th style="width: 5%;">S.No.</th>
                <th style="width: 15%; word-wrap: break-word;">Stamp Name</th>
                <th style="width: 25%; word-wrap: break-word;">Denomination</th>
                <th style="width: 25%; word-wrap: break-word;">Available Stock</th>
              </tr>
            </thead>
            <tbody style="font-size: 12px;">
              ${arrayData.map((eachitem, index) => `
                <tr class="page-break-avoid">
                  <td>${index + 1}</td>
                  <td style="word-wrap: break-word;">${eachitem.STAMP_NAME ?? '-'}</td>
                  <td>${eachitem.DENOMINATION ?? "-"}</td>
                  <td>${eachitem.BALANCE ?? '-'}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td></td>
                <td>
                  ${arrayData.reduce((sum, item) => sum + (parseInt(item.BALANCE) || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      const pdfBuffer = await generatePDFFromHTML(html, true);
      const base64Pdf = pdfBuffer.toString("base64");
      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("ReportServices - SROecOverallCountSrvc || Error :", ex);
      console.error("ReportServices - SROecOverallCountSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };


  
}

module.exports = stampsService;
