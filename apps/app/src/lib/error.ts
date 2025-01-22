export class ApiError extends Error {
  public code: string;

  constructor({ code }: { code: string }) {
    super(code);
    this.name = "ApiError";
    this.code = code;
  }
}
