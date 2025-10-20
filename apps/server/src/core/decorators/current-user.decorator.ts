import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: { id: string }; headers: any }>();

    if (!request.user) {
      return null;
    }

    return request.user as { id: string };
  },
);
