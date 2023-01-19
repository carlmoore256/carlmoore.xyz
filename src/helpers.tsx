export function incMinMax(
    currValue: number,
    changeBy: number = 1, 
    min : number = 0, 
    max: number | null = null) {
      if (currValue + changeBy < min) {
        return min;
      }
      if (max && currValue + changeBy > max) {
        return max;
      }
      return currValue + changeBy;
}

const CHARSET = ['*', '#', '%', '&', '$', '@'];

export function randomCharacter(charset : string[] = CHARSET) {
  const r = Math.round(Math.random() * (charset.length - 1));
  return charset[r];
}