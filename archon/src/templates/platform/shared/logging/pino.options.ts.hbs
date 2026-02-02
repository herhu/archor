export function pinoOptions() {
const isProd = process.env.NODE_ENV === 'production';

return {
pinoHttp: {
level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
redact: {
paths: ['req.headers.authorization', 'req.headers.cookie'],
remove: true
},
transport: isProd
? undefined
: {
target: 'pino-pretty',
options: { singleLine: true, colorize: true }
},
genReqId: function(req: any, res: any) {
return req.headers['x-correlation-id'] || undefined;
}
}
};
}