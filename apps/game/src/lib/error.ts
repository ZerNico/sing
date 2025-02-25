export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor({ code, status }: { code: string; status: number }) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
