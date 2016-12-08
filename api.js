'use strict';
/*eslint-env node, mocha, es6*/
//const bendchallenge = require('./lib/bend-challenge.js');
/**

 * @swagger
 * resourcePath: /api
 * description: All about API
 */

/**
 * @swagger
 * path: /order
 * operations:
 *   -  httpMethod: POST
 *      summary: place an order
 *      notes: Returns latest known blockcount
 *      responseClass: Blockcount
 *      nickname: blockcount
 *      parameters:
 *        - name: starttime
 *          description: unix timestamp (10 digits)
 *          paramType: query
 *          required: false
 *          dataType: integer
 *        - name: endtime
 *          description: unix timestamp (10 digits)
 *          paramType: query
 *          required: false
 *          dataType: integer
 */

// exports.blockcount = function* blockcount() {
//     const query = this.request ? this.request.query : undefined;
//     let starttime;
//     if (query.starttime === undefined && query.endtime === undefined) {
//         starttime = yield blocktool.getLatestBlockTime().then(
//             function(blockcount) {
//                 return parseInt(blockcount);
//             });
//     } else {
//         starttime = parseInt(query.starttime);
//     }
//     const endtime = query ? parseInt(query.endtime) : null;
//     this.body = {
//         'starttime': starttime,
//         'endtime': endtime,
//         'blockcount': yield blocktool.dateRangeToBlockCount({
//             'starttime': starttime || endtime,
//             'endtime': endtime || starttime
//         }),
//         'timestamp': new Date().getTime()
//     };
// };
