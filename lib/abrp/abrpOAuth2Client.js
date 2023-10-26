const Homey = require('homey');
const { OAuth2Client, OAuth2Error } = require('homey-oauth2app');

module.exports = class abrpOAuth2Client extends OAuth2Client {
    static API_URL = 'https://web.abetterrouteplanner.com/oauth';
    static TOKEN_URL = 'https://web.abetterrouteplanner.com/oauth/token';
    static AUTHORIZATION_URL = 'https://web.abetterrouteplanner.com/oauth/auth';
    static SCOPES = ['set_telemetry'];

    async onHandleNotOK({ body }) {
        throw new OAuth2Error(body.error);
    }

    async getDevices() {
        return this.get({
            path: '/me',
            query: { acces_token: this.getToken().acces_token, api_key: Homey.env.CLIENT_SECRET }
        });
    }
};
