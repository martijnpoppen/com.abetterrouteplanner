const Homey = require('homey');
const ABRP = require('../../lib/abrp');
const { sleep, getCurrentDatetime } = require('../../lib/helpers');

module.exports = class mainDevice extends Homey.Device {
    async onInit() {
        try {
            this.homey.app.log('[Device] - init =>', this.getName());

            await this.checkCapabilities();
            await this.setABRPClient(this.getSettings());

            await this.setAvailable();
        } catch (error) {
            this.homey.app.log(`[Device] ${this.getName()} - OnInit Error`, error);
        }
    }

    // ------------- Settings -------------
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        this.homey.app.log(`[Device] ${this.getName()} - oldSettings`, { ...oldSettings });
        this.homey.app.log(`[Device] ${this.getName()} - newSettings`, { ...newSettings });

        if (changedKeys.length) {
            await this.setABRPClient(newSettings);
        }
    }

    async setABRPClient(config) {
        this.ABRP = new ABRP({ ...config, api_key: Homey.env.API_KEY });
    }

    async onCapability_Send(params) {
        try {
            const tlm = {
                ...(params.soc && {soc: params.soc}),
                ...(params.power && {power: params.power}),
                ...(params.speed && {speed: params.speed}),
                ...(params.lat && {lat: params.lat}),
                ...(params.lon && {lon: params.lon}),
                ...(params.is_charging && {is_charging: params.is_charging}),
                ...(params.is_parked && {is_parked: params.is_parked}),
                ...(params.odometer && {odometer: params.odometer}),
                ...(params.est_battery_range && {est_battery_range: params.est_battery_range})
            }

            const data = await this.ABRP.send(tlm);

            if(data) {
                this.setCapabilityValue('measure_updated_at', getCurrentDatetime());
                return true
            }

            return false
        } catch (error) {
            this.homey.app.log(error.message);

            return Promise.reject(error.message);
        }
    }

    // ------------- Capabilities -------------
    async checkCapabilities() {
        const driverManifest = this.driver.manifest;
        const driverCapabilities = driverManifest.capabilities;

        const deviceCapabilities = this.getCapabilities();

        this.homey.app.log(`[Device] ${this.getName()} - Found capabilities =>`, deviceCapabilities);
        this.homey.app.log(`[Device] ${this.getName()} - Driver capabilities =>`, driverCapabilities);

        if (deviceCapabilities.length !== driverCapabilities.length) {
            await this.updateCapabilities(driverCapabilities, deviceCapabilities);
        }

        return deviceCapabilities;
    }

    async updateCapabilities(driverCapabilities, deviceCapabilities) {
        this.homey.app.log(`[Device] ${this.getName()} - Add new capabilities =>`, driverCapabilities);
        try {
            deviceCapabilities.forEach((c) => {
                this.removeCapability(c);
            });
            await sleep(2000);
            driverCapabilities.forEach((c) => {
                this.addCapability(c);
            });
            await sleep(2000);
        } catch (error) {
            this.homey.app.log(error);
        }
    }
};