/**
 * delete-jobs
 */
const Promise = require('bluebird');
const axios = require('axios');
const os = require('os');

const CONFIG = require('../config');

const PROMISE_CONCURRENCY = os.cpus().length - 1;
const MAX_PER_REQUEST = 100;

const log = (...args) => {
    console.log(...args);
};

const getJobs = (type, state, start, end, order) => {
    return axios.get(`${CONFIG.KUE_HOST}/jobs${type ? `/${type}` : ''}/${state}/${start}..${end}/${order}`)
    .then(res => {
        return res && res.data;
    });
};

const deleteJob = id => {
    return Promise.try(() => {
        return axios.delete(`${CONFIG.KUE_HOST}/job/${id}`);
    });
};

let count = 0;

const deleteJobsInBatch = ({
    type = '',
    state = 'failed',
    start = 0,
    end = 0
} = {}) => {
    const delta = end || 99 - start + 1;
    const left = end ? delta - MAX_PER_REQUEST : 0;
    let continueTo = true;

    end = delta < MAX_PER_REQUEST ? end : start + MAX_PER_REQUEST - 1;

    return Promise.try(() => {
        return getJobs(type, state, start, end, 'asc')
        .then(jobInfos => {
            const length = jobInfos.length;
            if (!length) {
                continueTo = false;
            }

            log(`deleting ${count} to ${count += length}`);

            return Promise.map(jobInfos, jobInfo => {
                return Promise.try(() => {
                    return deleteJob(jobInfo.id);
                })
                .delay(CONFIG.REQUEST_INTERVAL);
            }, {
                concurrency: PROMISE_CONCURRENCY
            });
        })
        .then(() => {
            if (continueTo && left >= 0) {
                return deleteJobsInBatch({
                    type,
                    state,
                    start,
                    end: left > 0 ? start + left - 1 : 0
                })
                .delay(CONFIG.REQUEST_INTERVAL);
            }
        });
    });
};

// main
module.exports = ({
    type = '',
    state = 'failed',
    start = 0,
    end = 0
} = {}) => {
    return Promise.try(() => {
        log('Preparing...');
    })
    .then(() => {
        log('Deleting');

        return deleteJobsInBatch({type, state, start, end});
    })
    .then(() => {
        log('Finished');
    })
    .catch(err => {
        const response = err && err.response;
        if (response) {
            let data = response.data;
            let msg = response.status + ' ' + response.statusText;

            if (data && data.message) {
                msg = data.message;
            }

            err = new Error(msg);

            err.response = response;
        }

        console.error(err, response ? response.data : response);
    });
};
