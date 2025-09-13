// logger.mjs

// ANSI 颜色代码
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',

	// 前景色
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	gray: '\x1b[90m',

	// 背景色
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m'
};

// 日志级别配置
const logLevels = {
	DEBUG: { color: colors.gray, prefix: '🐛 DEBUG' },
	INFO: { color: colors.green, prefix: 'ℹ️  INFO' },
	WARNING: { color: colors.yellow, prefix: '⚠️  WARNING' },
	ERROR: { color: colors.red, prefix: '❌ ERROR' }
};

// 获取时间戳
function getTimestamp() {
	return new Date().toISOString();
}

// 通用日志函数
function logWithColor(level, message, ...args) {
	const { color, prefix } = logLevels[level];
	const timestamp = colors.gray + getTimestamp() + colors.reset;
	const coloredPrefix = color + prefix + colors.reset;

	console.log(`${timestamp} ${coloredPrefix} ${message}`, ...args);
}

// 导出日志函数
export const logger = {
	debug: (message, ...args) => logWithColor('DEBUG', message, ...args),
	info: (message, ...args) => logWithColor('INFO', message, ...args),
	warning: (message, ...args) => logWithColor('WARNING', message, ...args),
	error: (message, ...args) => logWithColor('ERROR', message, ...args)
};

// 默认导出
export default logger;
