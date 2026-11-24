const Homey = require('homey');
const fetch = require('node-fetch');
const { OAuth2Client, OAuth2Error } = require('homey-oauth2app');

module.exports = class abrpOAuth2Client extends OAuth2Client {
    static API_URL = 'https://api.iternio.com/1/oauth';
    static TOKEN_URL = 'https://api.iternio.com/1/oauth/token';
    static AUTHORIZATION_URL = 'https://abetterrouteplanner.com/oauth/auth';
    static SCOPES = ['set_telemetry'];

    // ABRP's token endpoint takes client_id, client_secret (= the API key) and code
    // as query parameters. The library default POSTs a form body with grant_type and
    // redirect_uri, which this endpoint doesn't accept.
    async onGetTokenByCode({ code }) {
        const query = new URLSearchParams({
            client_id: this._clientId,
            client_secret: this._clientSecret,
            code
        });

        const response = await fetch(`${this._tokenUrl}?${query.toString()}`, { method: 'GET' });
        const text = await response.text();

        let json;
        try {
            json = JSON.parse(text);
        } catch (err) {
            json = null;
        }

        if (!response.ok || !json || !json.access_token) {
            const message = (json && (json.error_description || json.error || json.message)) || `Invalid token response (${response.status} ${response.statusText})`;
            this.error('[OAuth2] token request failed:', response.status, text);
            throw new OAuth2Error(message, response.status);
        }

        this._token = new this._tokenConstructor({
            access_token: json.access_token,
            token_type: json.token_type
        });

        return this.getToken();
    }

    async onHandleNotOK({ body, status, statusText }) {
        const message = (body && (body.error_description || body.error || body.message)) || `${status} ${statusText}`;
        throw new OAuth2Error(message, status);
    }

    async getDevices() {
        return this.get({
            path: '/me',
            query: { access_token: this.getToken().access_token, api_key: Homey.env.CLIENT_SECRET }
        });
    }
};
