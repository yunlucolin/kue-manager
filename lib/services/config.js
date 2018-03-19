const fs = require('fs');
const nconf = require('nconf');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config.json');

/*
  nconf.argv().env().file({file: configPath});

  Setup nconf to use (in-order):
  1. Command-line arguments
  2. Environment variables
  3. A file located at 'path/to/config.json'
 */
nconf.file({ file: CONFIG_PATH });

class Config {
    // constructor () {}

    // static add (key, value) {
    add (key, value) {
        if (!fs.existsSync(CONFIG_PATH)) {
            const defaultConfig = { REQUEST_INTERVAL: 500 };
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig));
        }

        // Set a few variables on `nconf`.
        nconf.set(key, value);

        // Save the configuration object to disk
        nconf.save(err => {
            if (err) {
                return console.error(err);
            }
            fs.readFile(CONFIG_PATH, (_err, data) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Saved Config:\n', data.toString());
            });
        });
    }
}

module.exports = Config;
