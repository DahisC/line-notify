'use strict';
const router = require('express').Router();
const axios = require('axios');
const qs = require('qs');

const p = (name, type, isRequired) => ({
  name,
  type,
  isRequired,
});

const requiredParameters = [
  p('client_id', 'string', true),
  p('client_secret', 'string', true),
  p('succeeded_route', 'string', true),
  p('failed_route', 'string', true),
];

const checkParameters = (parameters) => {
  requiredParameters.forEach((rp) => {
    const t = parameters[rp.name];
    if (!t && rp.isRequired) {
      throw new Error(`The parameter '${rp.name}' is Required.`);
    }

    if (typeof t !== rp.type)
      throw new Error(
        `Type of parameter '${rp.name}' is wrong, expect ${rp.type}`
      );
  });
};

//

module.exports = ({ state = 'default', ...parameters }) => {
  try {
    checkParameters(parameters);
  } catch (err) {
    console.error(err);
    return router;
  }

  const {
    client_id,
    client_secret,
    succeeded_route,
    failed_route,
  } = parameters;

  router.get('/line-notify/subscribe', async (req, res) => {
    const host = `${req.protocol}://${req.headers.host}`;

    const authorizeParams = {
      response_type: 'code',
      scope: 'notify',
      client_id,
      redirect_uri: host + '/line-notify/subscribe/authorizing',
      state,
    };

    const queryString = qs.stringify(authorizeParams);
    res.redirect('https://notify-bot.line.me/oauth/authorize?' + queryString);
  });

  router.get('/line-notify/subscribe/authorizing', async (req, res) => {
    const host = `${req.protocol}://${req.headers.host}`;
    if (!req.query.code) {
      res.redirect('/line-notify/subscribe');
    }

    const tokenParams = {
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: host + '/line-notify/subscribe/authorizing',
      client_id,
      client_secret,
    };

    try {
      const lineRes = await axios.post(
        'https://notify-bot.line.me/oauth/token',
        null,
        {
          params: tokenParams,
        }
      );
      const { access_token } = lineRes.data;
      const queryString = qs.stringify({
        access_token,
      });
      return res.redirect(succeeded_route + '?' + queryString);
    } catch (err) {
      const { status, message } = err.response.data;
      const queryString = qs.stringify({
        status,
        message,
      });
      return res.redirect(failed_route + '?' + queryString);
    }
  });

  return router;
};
