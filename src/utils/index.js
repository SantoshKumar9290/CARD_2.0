const Handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const CryptoJs = require('crypto-js');
/**
 * Return a string by adding variables
 * @param {String} string
 * @param {Object} variable
 * @returns {String}
 *
 * @example
 *
 * const str = "Order Id {{existingOrder}} for BU {{businessUnit}} already exists";
 * const variable = {"existingOrder": "12341234", "businessUnit": "facl"}
 * const newStr = parseString(str, variable);
 * console.log(newStr) // "Order Id 12341234 for BU facl already exists";
 */
exports.parseString = function(string, variable) {
  const template = Handlebars.compile(string);
  return template(variable);
};

/**
 * Convert array of string to object with key value pair
 * @param {String[]} arr
 * @returns {Object}
 *
 * @example
 * const arr = ["one", "two", "three"];
 * const returnData = stringArrayToObject(arr);
 * console.log(returnData) // {one: "one", two: "two", three: "three"};
 */
exports.stringArrayToObject = (arr = []) =>
  arr.reduce((acc, next) => {
    acc[next] = next;
    return acc;
}, {});

exports.transportEmail =  nodemailer.createTransport({
	host: "smtp-mail.outlook.com",
    port: 587,
            //secure: false,
    ssl:true,
    auth: {
		user: `${process.env.SMTP_EMAIL}`,
		pass: `${process.env.SMTP_PASSWORD}`
    },
});
exports.decryptWithAES = (ciphertext) => {
	const passphrase = process.env.adhar_Secret_key
	const bytes = CryptoJs.AES.decrypt(ciphertext, passphrase);
	const originalText = bytes.toString(CryptoJs.enc.Utf8);
	return originalText;
};

exports.encryptWithAESPassPhrase = (originalText, passphrase) => {
	const encryptedText = CryptoJs.AES.encrypt(originalText, passphrase).toString();
	return encryptedText;
};

exports.decryptWithAESPassPhrase = (ciphertext, passphrase) => {
  if(ciphertext == null || ciphertext.length == 0)
    return null;
	const bytes = CryptoJs.AES.decrypt(ciphertext, passphrase);
	const originalText = bytes.toString(CryptoJs.enc.Utf8);
	return originalText;
};
 
exports.encryptData = (data) => {
  const parsedkey = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_KEY);
  const iv = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_IV);
  const encrypted = CryptoJs.AES.encrypt(data, parsedkey, { iv: iv, mode: CryptoJs.mode.ECB, padding: CryptoJs.pad.Pkcs7 });
  return encrypted.toString();
}

exports.decryptData = (encryptedData) => {
  var keys = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_KEY);
  let base64 = CryptoJs.enc.Base64.parse(encryptedData);
  let src = CryptoJs.enc.Base64.stringify(base64);
  var decrypt = CryptoJs.AES.decrypt(src, keys, { mode: CryptoJs.mode.ECB, padding: CryptoJs.pad.Pkcs7 });
  return decrypt.toString(CryptoJs.enc.Utf8);
}
exports.AadharencryptData = (data) => {
  const parsedkey = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_KEY);
  const iv = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_IV);
  const encrypted = CryptoJs.AES.encrypt(data, parsedkey, { iv: iv, mode: CryptoJs.mode.ECB, padding: CryptoJs.pad.Pkcs7 });
  let encryptedData = Buffer.from(encrypted.toString()).toString('base64');
  return encryptedData;
}

exports.AadhardecryptData = (encryptedData) => {
	encryptedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
  var keys = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_KEY);
  let base64 = CryptoJs.enc.Base64.parse(encryptedData);
  let src = CryptoJs.enc.Base64.stringify(base64);
  var decrypt = CryptoJs.AES.decrypt(src, keys, { mode: CryptoJs.mode.ECB, padding: CryptoJs.pad.Pkcs7 });
  return decrypt.toString(CryptoJs.enc.Utf8);
}
exports.formatDate = (d, flag) => {
  const date = d ? (new Date((`${d}`.includes('T') && `${d}`.includes('Z')) ? Date.parse(d.substr(0, d.length - 1)) : d)) : flag ? new Date() : '';
  return date ? (this.z(date.getDate()) + '-' + this.z(date.getMonth() + 1) + '-' + date.getFullYear()) : ''
}

exports.toBase64 =(arr, b=false) => {
  //arr = new Uint8Array(arr) if it's an ArrayBuffer
  // return btoa(
  //    arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
  // );
  return b ? btoa(
       arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    ) : arr.toString('base64');
}

exports.z =(n) => {return (n<10?'0':'')+n};

exports.getValue = (obj, key) => {
  let d = null;
  function recur(o) {
    Object.keys(o).forEach(k => {
      if(k === key){
        d = o[k]
      } else if(typeof o[k] === 'object' && !Array.isArray(o[k])){
        recur(o[k])
      }
    })
  }

  recur(obj);
  return d;
}

exports.titleCase = (word) => {

  return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();

}

 

exports.returnCleanAddress = (word) => {

  if(word && typeof word === 'string'){

    let str = word;

    let arr = ['&', "*"];

    for(let i=0; i<arr.length; i++){

      if(str.includes(arr[i])){

        str = str.replaceAll(arr[i], ' ');

      }

    }

    return str;

  } else {

    return '';
  }
}

exports.returnCleanSpecialCharacters = (word) => {
  if (word && typeof word === 'string') {
    let str = word;
    const replacements = {
      '@': 'at',
      '&': 'and',
      '*': ' ',
      '$': ' ',
      '#': ' ',
    };
    for (let char in replacements) {
      if (str.includes(char)) {
        var re = new RegExp(char, "g");
        str = str.replaceAll(re, replacements[char]);
      }
    }
    return str;
  } else {
    return '';
  }

}

let fHash;
exports.hashGenerate = async (data)=>{
    let hash = this.encryptWithAESPassPhrase(data, "123456");
    if(String(hash).includes("/")){
        this.hashGenerate(data)
    }else{
        fHash = hash;
    }
    return fHash;
   
}

exports.getPrivateAttendanceStatus = async (odbDao, { sr_code, doct_no, reg_year, book_no }) => {
  const query = `
    SELECT 
      CASE 
        WHEN cca.PA_LAT IS NOT NULL AND cca.PA_LAN IS NOT NULL THEN 'Y'
        ELSE 'N'
      END AS IS_PRIVATE_ATTENDANCE
    FROM PDE_DOC_STATUS_CR pde
    JOIN PREREGISTRATION.PRE_REGISTRATION_CCA cca ON cca.ID = pde.APP_ID
    WHERE pde.SR_CODE = :sr_code
      AND pde.DOCT_NO = :doct_no
      AND pde.REG_YEAR = :reg_year
      AND pde.BOOK_NO = :book_no`;

  const params = { sr_code, doct_no, reg_year, book_no };
  const result = await odbDao.oDBQueryServiceWithBindParams(query, params);
  return result?.[0]?.IS_PRIVATE_ATTENDANCE || 'N';
};