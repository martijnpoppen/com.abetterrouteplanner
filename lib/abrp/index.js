const https = require('https');
const axios = require('axios');

class ABRP_iternio {
    constructor(params) {
        this.BASE_URI = 'https://api.iternio.com/1';
        this.timeout = parseInt(params.timeout) || 5000;

        this.api_key = params.api_key;
        this.token = params.token;

        this._isDebugMode = params.debug || false;

        this.axiosClient = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            timeout: this.timeout
        });
    }

    async getVehicleLibrary() {
        const apiUrl = `${this.BASE_URI}/tlm/get_carmodels_list`;

        const params = new URLSearchParams({
            api_key: this.api_key,
            token: this.token
        }).toString();

        const req = await this.axiosClient.get(`${apiUrl}?${params}`);

        if (req.status === 200) {
            return req.data;
        }

        return false;
    }

    async sendTlm(tlm) {
        const apiUrl = `${this.BASE_URI}/tlm/send`;

        const params = new URLSearchParams({
            api_key: this.api_key,
            token: this.token
        }).toString();

        const data = {
            "tlm": {
                utc: Math.floor(Date.now() / 1000),
                ...tlm
            }
        }

        const req = await this.axiosClient.post(`${apiUrl}?${params}`, data);

        if (req.status === 200) {
            return req.data;
        }

        return false;
    }
}

module.exports = ABRP_iternio;
