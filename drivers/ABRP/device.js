const Homey = require('homey');
const { OAuth2Device } = require('homey-oauth2app');
const { sleep, getCurrentDatetime } = require('../../lib/helpers');
const ABRP = require('../../lib/abrp');

module.exports = class mainDevice extends OAuth2Device {
    async onOAuth2Init() {
        try {
            this.homey.app.log('[Device] - init =>', this.getName());

            await this.checkCapabilities();
            await this.setABRPClient();

            await this.setAvailable();
        } catch (error) {
            this.homey.app.log(`[Device] ${this.getName()} - OnInit Error`, error);
        }
    }

    async setABRPClient() {
        this.ABRP = new ABRP({ token: this.oAuth2Client.getToken().access_token, api_key: Homey.env.CLIENT_SECRET });
    }

    async onCapability_Send(params) {
        try {
            const tlm = {
                ...(params.hasOwnProperty('soc') && { soc: params.soc }),
                ...(params.hasOwnProperty('power') && { power: params.power }),
                ...(params.hasOwnProperty('speed') && { speed: params.speed }),
                ...(params.hasOwnProperty('lat') && { lat: params.lat }),
                ...(params.hasOwnProperty('lon') && { lon: params.lon }),
                ...(params.hasOwnProperty('is_charging') && { is_charging: params.is_charging }),
                ...(params.hasOwnProperty('is_parked') && { is_parked: params.is_parked }),
                ...(params.hasOwnProperty('odometer') && { odometer: params.odometer }),
                ...(params.hasOwnProperty('est_battery_range') && { est_battery_range: params.est_battery_range })
            };

            this.homey.app.log(`[Device] ${this.getName()} - onCapability_Send`, tlm);

            const data = await this.ABRP.sendTlm(tlm);

            if (data) {
                this.setCapabilityValue('updated_at', getCurrentDatetime());
                return true;
            }

            return false;
        } catch (error) {
            this.homey.app.log(error.message);

            return Promise.reject(error.message);
        }
    }

    // ------------- Capabilities -------------
    async checkCapabilities() {
        const driverManifest = this.driver.manifest;
        let driverCapabilities = driverManifest.capabilities;
        const deviceCapabilities = this.getCapabilities();

        this.homey.app.log(`[Device] ${this.getName()} - checkCapabilities for`, driverManifest.id);
        this.homey.app.log(`[Device] ${this.getName()} - Found capabilities =>`, deviceCapabilities);


        await this.updateCapabilities(driverCapabilities, deviceCapabilities);

        return;
    }

    async updateCapabilities(driverCapabilities, deviceCapabilities) {
        try {
            const newC = driverCapabilities.filter((d) => !deviceCapabilities.includes(d));
            const oldC = deviceCapabilities.filter((d) => !driverCapabilities.includes(d));

            this.homey.app.log(`[Device] ${this.getName()} - Got old capabilities =>`, oldC);
            this.homey.app.log(`[Device] ${this.getName()} - Got new capabilities =>`, newC);

            oldC.forEach((c) => {
                this.homey.app.log(`[Device] ${this.getName()} - updateCapabilities => Remove `, c);
                this.removeCapability(c).catch(e => this.homey.app.log(e));
            });
            await sleep(2000);
            newC.forEach((c) => {
                this.homey.app.log(`[Device] ${this.getName()} - updateCapabilities => Add `, c);
                this.addCapability(c).catch(e => this.homey.app.log(e));
            });
            await sleep(2000);
        } catch (error) {
            this.homey.app.log(error);
        }
    }
};
