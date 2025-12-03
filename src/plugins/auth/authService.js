var jwt = require('jsonwebtoken');
const { decryptWithAESPassPhrase } = require('../../utils');

const verifyUser = (req, res) => {
    try {
        return new Promise(function (resolve, reject) {
            const Header = req.headers["authorization"];
            if (typeof Header !== "undefined") {
                try {
                    const verified = jwt.verify(Header, process.env.JWT_SECRET_KEY);

                    if (verified) {
                        resolve(verified);
                    } else {
                        reject('Invalid User');
                    }
                } catch (error) {
                    reject('Invalid User');
                }
            } else {
                reject('Invalid User');
            }
        })
    } catch (e) {
        logger.warn(e.message);
        res.status(403).send({
            success: false,
            message: e.message,
            data: {}
        });
    }
}

const authUser = (req, res, next) => {
    verifyUser(req, res).then(result => {
        req.userId = result.userId;
        req.userTypeId = result.userTypeId;
        next();
    }).catch(error => {
        res.status(401).send({
            status: false,
            message: error,
            data: {}
        });
    });
}

const authGenerator = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}



const getUserInfo = async (user)=>{
	const userInfo= {
		_id:user._id,
		userId:user._id,
		loginEmail: user.loginEmail,
		loginName:user.loginName,
		loginMobile: user.loginMobile,
		loginType:user.loginType
	}
	userInfo.aadhar = user?.aadhar ?user.aadhar :"";
	return userInfo;
};

const createToken =async (user,refreshTokenUrl) => {

	let jwtSecretKey = process.env.JWT_SECRET_KEY;
	const expiresIn =process.env.JWT_EXP_IN;
	const token = jwt.sign(user,jwtSecretKey,{ expiresIn: expiresIn });
	// await tokenModel.findOneAndUpdate({userId:user._id,loginType:user.loginType,status:false},{refreshToken:refreshTokenUrl,status:true},{upsert:true});
	return{
        token,
        expires: expiresIn,
		refreshTokenUrl
    };
}

/*Middleware for verifying the JWT Token. */
const verifyjwt = async function (req, res, next) {
	try {
		let tokenHeader = req.headers['authorization'];
        if(req.body?.hash != null){
			var origialText = decryptWithAESPassPhrase(req.body.hash.toString(), process.env.HASH_ENCRYPTION_KEY);
			const { ['hash']: hash, ...reqBodyWithoutHash } = req.body;
			if(JSON.stringify(reqBodyWithoutHash) != origialText){
				return res.status(422).send({ error: 'Request Mismatch.' });
			}

		}
		if (tokenHeader) {
			let token = await tokenHeader.split(" ");
			  let decoded = jwt.verify(token[1], process.env.JWT_SECRET_KEY);
			if (decoded) {
				req.user = decoded;
				let currentTime = (new Date().getTime())/1000;
				if(decoded.exp < currentTime)
					return res.status(401).json({ success: false, error: 'Token Validity Expired.' });
				else    
					return next();
			}else{
				return res.status(401).json({ success: false, error: 'Unauthorized Token. User Token required.' });
			}      
		}else{
			return res.status(401).json({ success: false, error: "Unauthorized Token. User Token required." })
		}
	} catch (error) {
		console.log("error ::: ", error);
		return res.status(401).json({ success: false, error: 'JWT Token is expired.' })
	}
}

const roleAuthorization = (roles)=>{
	return async (req,res,next)=>{
        const user = req.user;
        const findUser =await userModel.findById(user.userId);
        if(!findUser){
            res.status(422).send({ error: 'No user found.' });
            return next();
        }
        else if(roles.indexOf(findUser.loginType) > -1){
            return next();
        }else{
            return res.status(401).send({statusCode:401, error: `As a ${roles},Your Not a authorized person to view this content` });
            next();
        }
    }
}

//Third party service
const validateThirdPartyAccess = function (req, res, next) {
    try {
        console.log("Inside of validateThirdPartyAccess :::: ");
        const APIKEY = req.headers["api-key"];
        console.log("APIKEY :::: ", APIKEY);
        if (APIKEY != undefined) {
            try {
                let verified;
                console.log("CARD_API_KEY :::: ", process.env.CARD_API_KEY);
                if(APIKEY == process.env.CARD_API_KEY)
                    verified = true;
 
                if (verified) {
                    console.log("End of validateThirdPartyAccess :::: ");
                    return next();
                } else {
                    console.log("End of validateThirdPartyAccess :::: ");
                    return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
                }
            } catch (error) {
                console.log("End of validateThirdPartyAccess :::: ");
                return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
            }
        } else {
            console.log("End of validateThirdPartyAccess :::: ");
            return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
        }
    } catch (e) {
        console.log("End of validateThirdPartyAccess :::: ");
        logger.warn(e.message);
        return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
    }
}



module.exports ={getUserInfo,createToken,authUser,authGenerator,verifyjwt,roleAuthorization,validateThirdPartyAccess}
