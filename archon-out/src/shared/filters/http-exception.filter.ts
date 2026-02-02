import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const correlationId = req.headers["x-correlation-id"];

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    const message =
      typeof payload === "string"
        ? payload
        : (payload as any).message || (payload as any).error || "Error";

    res.status(status).json({
      statusCode: status,
      message,
      path: req.url,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
