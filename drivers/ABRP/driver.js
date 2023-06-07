const Homey = require('homey');
const { OAuth2Driver } = require('homey-oauth2app');

module.exports = class mainDriver extends OAuth2Driver {
    async onOAuth2Init() {
        this.homey.app.log('[Driver] - init', this.id);
        this.homey.app.log(`[Driver] - version`, Homey.manifest.version);
    }

    async onPairListDevices({ oAuth2Client }) {
        const device = await oAuth2Client.getDevices();

        return [
            {
                name: device.vehicle_name,
                data: {
                    id: device.vehicle_id
                },
                settings: {
                    vehicle_typecode: device.vehicle_typecode
                }
            }
        ];
    }
};
