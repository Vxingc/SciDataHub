// server_config.js
export default {
	port: 3101,
	corsOptions: {
		origin: '*',
		methods: ['GET', 'POST'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	},
};