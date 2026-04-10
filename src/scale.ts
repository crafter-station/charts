export interface Scale {
	domain: [number, number];
	range: [number, number];
	map(value: number): number;
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
	const [d0, d1] = domain;
	const [r0, r1] = range;
	const dSpan = d1 - d0;
	return {
		domain,
		range,
		map(value: number): number {
			if (dSpan === 0) return Math.round((r0 + r1) / 2);
			const normalized = (value - d0) / dSpan;
			return Math.round(r0 + normalized * (r1 - r0));
		},
	};
}

export function autoExtent(values: number[]): [number, number] {
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const v of values) {
		if (v < min) min = v;
		if (v > max) max = v;
	}
	if (min === max) {
		return [min - 1, max + 1];
	}
	return [min, max];
}
