import config from '../config/env';

export const loggerConfig = {
  level: config.NODE_ENV === 'test' ? 'silent' : config.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'req.headers["set-cookie"]',
      'body.password',
      'body.currentPassword',
      'body.newPassword',
      'password',
      'passwordHash',
      'token',
      'tokenHash',
      'secret',
      'cookie',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req(req: any) {
      return {
        method: req.method,
        url: req.url,
        path: req.routeOptions?.url || req.url,
        parameters: req.params,
        headers: {
          host: req.headers.host,
          'user-agent': req.headers['user-agent'],
          'x-request-id': req.headers['x-request-id'],
        },
      };
    },
    res(res: any) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
};
