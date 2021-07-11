export class InvalidCodepointError extends Error {
  public readonly text: string;
  public readonly index: number;

  public constructor(text: string, index: number) {
    super(`Invalid codepoint '${[...text][index]}' at index ${index}`);
    this.text = text;
    this.index = index;
  }
}

export class BidiError extends Error {
  public readonly text: string;
  public readonly index: number;

  public constructor(text: string, index: number) {
    super(
      `Invalid bidirectional codepoint '${[...text][index]}' at index ${index}`,
    );
    this.text = text;
    this.index = index;
  }
}

export class EmptyStringError extends Error {
  public readonly text: string;

  public constructor(text: string) {
    super('Result string is empty');
    this.text = text;
  }
}
