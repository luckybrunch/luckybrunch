import { UserType } from "@prisma/client";
import superjson from "superjson";

import rateLimit from "@calcom/lib/rateLimit";

import { initTRPC, TRPCError } from "@trpc/server";

import { Context } from "./createContext";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const perfMiddleware = t.middleware(async ({ path, type, next }) => {
  performance.mark("Start");
  const result = await next();
  performance.mark("End");
  performance.measure(`[${result.ok ? "OK" : "ERROR"}][$1] ${type} '${path}'`, "Start", "End");
  return result;
});

const isAuthedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers that `user` and `session` are non-nullable to downstream procedures
      session: ctx.session,
      user: ctx.user,
    },
  });
});

const isAdminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.session || ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers that `user` and `session` are non-nullable to downstream procedures
      session: ctx.session,
      user: ctx.user,
    },
  });
});
interface IRateLimitOptions {
  intervalInMs: number;
  limit: number;
}
const isRateLimitedByUserIdMiddleware = ({ intervalInMs, limit }: IRateLimitOptions) =>
  t.middleware(({ ctx, next }) => {
    // validate user exists
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { isRateLimited } = rateLimit({ intervalInMs }).check(limit, ctx.user.id.toString());

    if (isRateLimited) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    return next({
      ctx: {
        // infers that `user` and `session` are non-nullable to downstream procedures
        session: ctx.session,
        user: ctx.user,
      },
    });
  });

// Used after authentication step
const createDraftProfileForCoachesMiddleware = t.middleware(async ({ ctx, next }) => {
  if (ctx.user?.userType === UserType.COACH && !ctx.user.coachProfileDraft) {
    await ctx.prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        coachProfileDraft: {
          create: {
            firstName: ctx.user.firstName ?? "",
            lastName: ctx.user.lastName ?? "",
          },
        },
      },
    });
  }

  // To prevent repetitve checks for ctx.user and ctx.session, this middleware is used after authentication
  type User = NonNullable<typeof ctx.user>;
  type Session = NonNullable<typeof ctx.session>;

  return next({
    ctx: {
      session: ctx.session as Session,
      user: ctx.user as User,
    },
  });
});

// Used after authentication step
const isCoachMiddleware = t.middleware(async ({ ctx, next }) => {
  if (ctx.user?.userType !== UserType.COACH) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // To prevent repetitve checks for ctx.user and ctx.session, this middleware is used after authentication
  type User = NonNullable<typeof ctx.user>;
  type Session = NonNullable<typeof ctx.session>;

  return next({
    ctx: {
      // infers that `user` and `session` are non-nullable to downstream procedures
      session: ctx.session as Session,
      user: ctx.user as User,
    },
  });
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
export const publicProcedure = t.procedure.use(perfMiddleware);
export const authedProcedure = t.procedure
  .use(perfMiddleware)
  .use(isAuthedMiddleware)
  .use(createDraftProfileForCoachesMiddleware);
export const authedCoachProcedure = t.procedure
  .use(perfMiddleware)
  .use(isAuthedMiddleware)
  .use(isCoachMiddleware)
  .use(createDraftProfileForCoachesMiddleware);
export const authedRateLimitedProcedure = ({ intervalInMs, limit }: IRateLimitOptions) =>
  t.procedure
    .use(perfMiddleware)
    .use(isAuthedMiddleware)
    .use(isRateLimitedByUserIdMiddleware({ intervalInMs, limit }));

export const authedAdminProcedure = t.procedure.use(perfMiddleware).use(isAdminMiddleware);
