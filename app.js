'use strict';

const { OAuth2App } = require('homey-oauth2app');
const abrpOAuth2Client = require('./lib/abrp/abrpOAuth2Client');
const flowActions = require('./lib/flows/actions');

class ABRP extends OAuth2App {
  static OAUTH2_CLIENT = abrpOAuth2Client;
  static OAUTH2_DEBUG = true;
  static OAUTH2_MULTI_SESSION = true;

    log() {
        console.log.bind(this, "[log]").apply(this, arguments);
      }
    
      error() {
        console.error.bind(this, "[error]").apply(this, arguments);
      }
	
	// -------------------- INIT ----------------------

    async onOAuth2Init() {
        this.log(`${this.homey.manifest.id} - ${this.homey.manifest.version} started...`);

        await flowActions.init(this.homey);
    }
}

module.exports = ABRP;