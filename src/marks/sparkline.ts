import { blockChar } from "../charsets/block";
import { ANSI_COLORS, ANSI_RESET, type SparklineOptions } from "../types";

function downsample(data: number[], targetWidth: number): number[] {
	if (data.length <= targetWidth) return data;
	const result: number[] = [];
	const bucketSize = data.length / targetWidth;
	for (let i = 0; i < targetWidth; i++) {
		const start = Math.floor(i * bucketSize);
		const end = Math.floor((i + 1) * bucketSize);
		let sum = 0;
		let count = 0;
		for (let j = start; j < end && j < data.length; j++) {
			sum += data[j]!;
			count++;
		}
		result.push(count > 0 ? sum / count : 0);
	}
	return result;
}

export function renderSparkline(data: number[], options: SparklineOptions = {}): string {
	if (data.length === 0) return "";

	const width = options.width ?? data.length;
	const sampled = downsample(data, width);

	const min = options.min ?? Math.min(...sampled);
	const max = options.max ?? Math.max(...sampled);

	const chars = sampled.map((v) => blockChar(v, min, max)).join("");

	if (options.color) {
		const code = ANSI_COLORS[options.color];
		return `${code}${chars}${ANSI_RESET}`;
	}

	return chars;
}

export function renderSparklineString(data: number[], options: SparklineOptions = {}): string {
	return renderSparkline(data, { ...options, color: undefined });
}
