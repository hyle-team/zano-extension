import http from 'node:http';

const DESIRED_ORIGIN = 'chrome-extension://akcgnllhhhkcpmlenfpicmcpgfpindlb';

function readPort(name: string): number {
	const value = Number(process.env[name]);
	if (!Number.isInteger(value) || value <= 0 || value > 65535) {
		console.error(`${name} is missing or invalid in .env`);
		process.exit(1);
	}
	return value;
}

const PROXY_PORT = readPort('DEV_PROXY_PORT');
const FORWARDING_PORT = readPort('DEV_PROXY_FORWARDING_PORT');

const server = http.createServer((req, res) => {
	const headers = {
		...req.headers,
		Origin: DESIRED_ORIGIN,
		origin: DESIRED_ORIGIN,
	};

	const proxyReq = http.request(
		{
			host: '127.0.0.1',
			port: FORWARDING_PORT,
			method: req.method,
			path: req.url,
			headers,
		},
		(proxyRes) => {
			res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
			proxyRes.pipe(res);
		},
	);

	proxyReq.on('error', (error) => {
		console.error(`Forwarding to port ${FORWARDING_PORT} failed: ${error.message}`);
		if (!res.headersSent) {
			res.writeHead(502, { 'Content-Type': 'text/plain' });
		}
		res.end('Bad Gateway');
	});

	req.pipe(proxyReq);
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
	console.log(`Dev proxy listening on ${PROXY_PORT}, forwarding to ${FORWARDING_PORT}`);
});
