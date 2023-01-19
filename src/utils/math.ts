

export interface NormalizedValue {
    value: number;
    min: number;
    max: number;
    avg: {
        norm: number;
        orig: number;
        count: number;
    }
    origValue?: number;
}

export function normalize(value : number, min : number, max : number, halfInit=false) : number {
    var d = max-min;
    if (halfInit)
    if (d == 0) {
        if (halfInit) return 0.5;
        d = Number.MIN_VALUE
    }
    return (value - min) / (max - min);
}

// https://stackoverflow.com/questions/12636613/how-to-calculate-moving-average-without-keeping-the-count-and-data-total
/** Approximate a rolling average
 * @param avg current average
 * @param newValue new value to create the average with
 * @param N number of samples to approximate an average over
*/
export function approxRollingAvg(avg : number, newValue : number, N : number) : number {
    if (N === 0) N = 1;
    avg -= avg / N;
    avg += newValue / N;
    return avg;
}

export function applyNormalizedValue(value : number, normValue : NormalizedValue) {
    normValue.origValue = value;
    normValue.min = Math.min(value, normValue.min);
    normValue.max = Math.max(value, normValue.max);
    normValue.value = normalize(value, normValue.min, normValue.max, false);
    normValue.avg.count += 1;
    normValue.avg.norm = approxRollingAvg(normValue.avg.norm, normValue.value, normValue.avg.count);
    normValue.avg.orig = approxRollingAvg(normValue.avg.orig, value, normValue.avg.count);
}

export function getDistance(x1 : number, y1 : number, x2 : number, y2 : number){
    let y = x2 - x1;
    let x = y2 - y1;
    return Math.sqrt(x * x + y * y);
}