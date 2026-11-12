import {
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

/** Flattens nested class-validator errors into "path: constraint" strings. */
export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): string[] {
  return errors.flatMap((error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own = Object.values(error.constraints ?? {}).map(
      (constraint) => `${path}: ${constraint}`,
    );
    return [...own, ...flattenValidationErrors(error.children ?? [], path)];
  });
}

/**
 * Validates but hands the handler the original value. Nest's own pipe returns
 * a class-transformer round-trip of the body once any validator option is
 * set, which would subtly reshape payloads for every existing handler.
 */
class ValidateOnlyPipe extends ValidationPipe {
  override async transform(value: unknown, metadata: ArgumentMetadata) {
    await super.transform(value, metadata);
    return value;
  }
}

/**
 * Global request-body validation. Only DTO classes that carry class-validator
 * decorators are checked; undecorated DTOs pass through unchanged, so
 * validation can be rolled out DTO by DTO.
 *
 * - Nothing is transformed: services keep receiving the plain request object.
 * - `whitelist` stays off: DTOs are shared between requests and responses and
 *   clients send response-only fields (id, delete_possible, ...) back.
 * - The response keeps a single string `message` with the "Validation:" prefix
 *   the registration SPA and controllers already treat as a 400.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidateOnlyPipe({
    transform: false,
    whitelist: false,
    forbidUnknownValues: false,
    exceptionFactory: (errors) =>
      new BadRequestException(
        `Validation: ${flattenValidationErrors(errors).join('; ')}`,
      ),
  });
}
