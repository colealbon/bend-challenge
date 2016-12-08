"use strict";

/*eslint-env node, es6*/
// const memoizee = require('memoizee');
// const memProfile = require('memoizee/profile');
// const Promise = require("bluebird");
// const retry = require("retry-bluebird");
// const blockchainxd = require("bitcoin-promise");
// const config = require(__dirname + '/../config/options.js');
// const typecheck = require(__dirname + '/typecheck.js');
// const winston = require('winston');
// const assign = require('object-assign');

// const client = new blockchainxd.Client({
//     host: config.blockchainxd_host,
//     user: config.blockchainxd_rpc_user,
//     pass: config.blockchainxd_rpc_pass,
//     timeout: 60000
// });
//
// const logger = new(winston.Logger)({
//     transports: [new(winston.transports.File)({
//         filename: config.winston_log_file
//     })],
//     level: config.winston_log_level
// });
//
// module.exports.statistics = memProfile.statistics;


// const dateRangeToBlockRange = function dateRangeToBlockRange(
//     daterange) {
//     logger.debug({
//         'dateRangeToBlockRange <-': {
//             'daterange': daterange
//         }
//     });
//     const starttime = daterange.starttime;
//     const endtime = daterange.endtime;
//     typecheck.dateRangeGuard({
//         'starttime': starttime,
//         'endtime': endtime
//     });
//     return Promise.props({
//             blockcountlow: timeToBlockCount(starttime),
//             blockcounthigh: timeToBlockCount(endtime)
//         })
//         .then(function(blockrange) {
//             logger.debug({
//                 'dateRangeToBlockRange->': {
//                     'blockrange': blockrange
//                 }
//             });
//             typecheck.blockRangeGuard(blockrange);
//             return blockrange;
//         });
// };
// module.exports.dateRangeToBlockRange = dateRangeToBlockRange;
