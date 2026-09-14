import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Registered globally in main.ts. Every unhandled error in the app passes
// through here before reaching the client — this is what guarantees the
// project's "never expose raw database/API errors" rule holds even for
// bugs nobody anticipated, not just the errors each service explicitly
// throws as HttpExceptions.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please try again.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as any).message || message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Known Prisma errors (unique constraint, not found, etc.) get a
      // generic 400 rather than leaking table/column names to the client.
      status = HttpStatus.BAD_REQUEST;
      message = 'This request could not be completed — the data may already exist or be invalid.';
    }

    // Full detail always goes to the server log, regardless of what the
    // client sees.
    this.logger.error(
      `${request.method} ${request.url} -> ${status}: ${exception instanceof Error ? exception.message : exception}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
