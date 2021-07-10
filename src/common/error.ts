export class PrecisInvalidCharacterError extends Error {
  public readonly index: number;

  public constructor(index: number) {
    super(`Invalid character at index ${index}`);
    this.index = index;
  }
}
