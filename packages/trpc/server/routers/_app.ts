/**
 * This file contains the root router of your tRPC-backend
 */
import { router } from "../trpc";
import { publicRouter } from "./public";
import { viewerRouter } from "./viewer";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = router({
  public: publicRouter,
  viewer: viewerRouter,
});

export type AppRouter = typeof appRouter;
