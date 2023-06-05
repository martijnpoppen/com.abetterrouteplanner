const Homey = require('homey');
const ABRP = require('../../lib/abrp');

module.exports = class mainDriver extends Homey.Driver {
    onInit() {
        this.homey.app.log('[Driver] - init', this.id);
        this.homey.app.log(`[Driver] - version`, Homey.manifest.version);
    }

    GetGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    async onPair(session) {
        session.setHandler('login', async (data) => {
            try {
                this.config = {
                    user_token: data.username,
                };

                this.deviceName = data.password,

                this.homey.app.log(`[Driver] ${this.id} - got config`, { ...this.config });

                this.ABRP = new ABRP({...this.config, api_key: Homey.env.API_KEY});

                return true;
            } catch (error) {
                console.log(error);
                throw new Error(this.homey.__('pair.error'));
            }
        });

        session.setHandler('add_device', async () => {
            try {
                return {
                    name: `ABRP - ${this.deviceName}`,
                    data: {
                        id: this.GetGUID()
                    },
                    settings: {
                        ...this.config
                    }
                };
            } catch (error) {
                return Promise.reject(error);
            }
        });
    }
};
