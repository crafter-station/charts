export interface SparklineOptions {
	width?: number;
	min?: number;
	max?: number;
	color?: AnsiColor;
}

export type AnsiColor =
	| "red"
	| "green"
	| "yellow"
	| "blue"
	| "magenta"
	| "cyan"
	| "white"
	| "gray";

export const ANSI_COLORS: Record<AnsiColor, string> = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	gray: "\x1b[90m",
};

export const ANSI_RESET = "\x1b[0m";
