const axios = require('axios');
const https = require('https');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});



class ApiInfoService {

    informApiInfoService = async  (req, res) => {
        try {

            if(res.statusCode == 200)
                return;
            
            let data = JSON.stringify({
                "api": req.url,
                "ipAddress": process.env.IP_ADDRESS,
                "responseCode": res.statusCode
            });


            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.API_INFO_IP_ADDRESS}/systemMonitoring/v1/apiInfo`,
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : data
            };

            await instance.request(config);

            return; 
              
        } catch (error) {
            
            return ;
        }
    } 
}

module.exports = ApiInfoService;