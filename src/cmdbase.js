const yargs = require('yargs');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, './config.json');

try {
    require('./config.json');
} catch (e) {
    const defaultConfig = { REQUEST_INTERVAL: 100 };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig));
}

const Config = require('./services/config');
const deleteJobs = require('../src/services/delete-jobs');

class CmdBase {
    constructor () {
        this.CONFIG_PERMITTED_KEYS = ['KUE_HOST', 'REQUEST_INTERVAL'];
        this.DELETE_OPTIONS = [{
            name: 'state',
            alias: 's',
            describe: 'job state',
            default: 'failed',
            show: true
        }, {
            name: 'type',
            alias: 't',
            describe: 'job type, default "" for all',
            default: '',
            show: true
        }, {
            name: 'start',
            alias: 'si',
            describe: 'start index',
            default: 0,
            show: true
        }, {
            name: 'end',
            alias: 'ei',
            describe: 'end index, default 0 for all',
            default: 0,
            show: true
        }];
    }

    exec () {
        return yargs.usage('usage: kue-manager <command/options>')
        .command({
            command: 'config <key> [value]',
            aliases: ['cnf'],
            desc: 'KUE_HOST, Host url for your kue jobs\nREQUEST_INTERVAL, interval between requests',
            handler: argv => {
                if (!this.CONFIG_PERMITTED_KEYS.includes(argv.key)) {
                    console.error(`ERROR: Illegal config key.\nPermitted:\n${this.CONFIG_PERMITTED_KEYS.toString()}`);

                    return;
                }

                const config = new Config();
                config.add(argv.key, argv.value);
            }
        })
        .command({
            command: 'delete',
            aliases: ['d'],
            desc: 'delete jobs',
            builder: yargs => {
                for (const option of this.DELETE_OPTIONS) {
                    yargs.option(option.name, option);
                }
            },
            handler: argv => {
                return deleteJobs({
                    type: argv.type,
                    state: argv.state,
                    start: argv.start,
                    end: argv.end
                });
            }
        })
        // TODO: list
        /*
        {
            option: 'list',
            alias: 'ls',
            describe: 'list jobs state',
            default: false,
            show: true
        }
        */
        // TODO: alias for help
        .help()
        .argv;
    }
}

module.exports = CmdBase;
