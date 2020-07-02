'use strict';
const router = require('express').Router();

// let base = {
//   auth_route: undefined,
// };

// let authorizeParams = {
//   response_type: 'code',
//   client_id: undefined,
//   redirect_uri: undefined,
//   scope: 'notify',
//   state: undefined,
// };

// let tokenParams = {
//   grant_type: 'authorization_code',
//   code: undefined,
//   redirect_uri: undefined,
//   client_id: undefined,
//   client_secret: undefined,
// };

exports.lineNotify = function ({ client_id }) {
  console.log(client_id);
  router.get('/line-notify/subscribe', (req, res) => {
    console.log(req.query);
    res.send('Step 1 authorize');
  });

  return router;
};
