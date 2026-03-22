import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<{ user?: Record<string, unknown> }>();
  const user = req.user || {};
  return data ? user[data] : user;
});
