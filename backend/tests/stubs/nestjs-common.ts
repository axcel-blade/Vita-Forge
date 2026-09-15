export class UnauthorizedException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class ServiceUnavailableException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ServiceUnavailableException';
  }
}

export class HttpException extends Error {
  constructor(
    public readonly response: unknown,
    public readonly status = 500,
  ) {
    super(typeof response === 'string' ? response : 'HttpException');
    this.name = 'HttpException';
  }
  getStatus() {
    return this.status;
  }
  getResponse() {
    return this.response;
  }
}

export class ConflictException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ConflictException';
  }
}

export class NotFoundException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}

export class Logger {
  constructor(_context?: string) {}
  log(_message: unknown) {}
  error(_message: unknown, _trace?: unknown) {}
  warn(_message: unknown) {}
}

export type OnModuleInit = { onModuleInit: () => unknown };
export type OnModuleDestroy = { onModuleDestroy: () => unknown };

export const Catch = () => (target: unknown) => target;
export type ExceptionFilter = { catch: (...args: unknown[]) => void };
export type ArgumentsHost = { switchToHttp: () => unknown };
export const Headers = () => () => undefined;
export const Module = () => (target: unknown) => target;

export const Injectable = () => (target: unknown) => target;
export const Optional = () => () => undefined;
export const Inject = (_token?: unknown) => () => undefined;
export const Global = () => (target: unknown) => target;
export const Param = (_name?: string) => () => undefined;
export const Query = (_name?: string) => () => undefined;
export const Req = () => () => undefined;
export const Res =
  (_options?: unknown) =>
  () =>
    undefined;
export const Controller = (_path?: string) => (target: unknown) => target;
export const Post = (_path?: string) => () => undefined;
export const Get = (_path?: string) => () => undefined;
export const Delete = (_path?: string) => () => undefined;
export const Patch = (_path?: string) => () => undefined;
export const Body = () => () => undefined;
export const HttpCode = (_code?: number) => () => undefined;
export const UseGuards = (..._guards: unknown[]) => () => undefined;
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
};

export type INestApplication = {
  enableCors: (options: unknown) => void;
};
