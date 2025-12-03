const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../../utils/index');

let dbConfig = {
	user: process.env.ORACLE_DB_USER,
        password:decryptWithAESPassPhrase(process.env.ORACLE_DB_PASSWORD,process.env.adhar_Secret_key),
	//password: process.env.ORACLE_DB_PASSWORD,
	connectionString: process.env.ORACLE_DB_CON_STRING
};

let dbConfigSro = {
    user: process.env.ORACLE_DB_SRUSER,
    password: decryptWithAESPassPhrase(process.env.ORACLE_DBSR_PASSWORD, process.env.HASH_ENCRYPTION_KEY),
    // process.env.ORACLE_DB_PASSWORD,
    connectionString: process.env.ORACLE_DB_CON_STRING
};

let dbConfigCC = {
	user: process.env.ORACLE_OLDUSER,
	password: process.env.ORACLE_OLDPASSWORD,
	connectionString: process.env.ORACLE_OLDDB
};

let readDbConfig = {
    user: process.env.ORACLE_DB_READ_USER,
    password:decryptWithAESPassPhrase(process.env.ORACLE_DB_READ_PASSWORD,process.env.adhar_Secret_key),
    //password: process.env.ORACLE_DB_READ_PASSWORD,
    connectionString: process.env.ORACLE_DB_READ_CON_STRING
};

async function doRelease(connection) {
	connection.release((err) => {
		if (err) {
			console.error(err.message);
		}
	});
}


module.exports = { doRelease, dbConfig, dbConfigSro, dbConfigCC, readDbConfig };

