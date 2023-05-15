import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from "uuid";

import { TRPCError } from "@trpc/server";

import { router, publicProcedure, authedProcedure } from "../../trpc";

export const coachesRouter = router({
  search: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const coaches = await prisma.coach.findMany({
      select: {
        id: true,
        name: true,
        bio: true,
        // TODO: Add avatar through join or also duplicate to Coach model?
        user: {
          select: {
            avatar: true,
          },
        },
        specializations: {
          select: {
            id: true,
            icon: true,
            label: true,
          },
        },
      },
    });

    return coaches;
  }),
  getSignedUrl: authedProcedure.query(async () => {
    const s3Bucket = process.env.S3_BUCKET || "";
    const s3Endpoint = process.env.S3_ENDPOINT || "";
    const s3Region = process.env.S3_REGION || "";
    const s3Key = process.env.S3_KEY || "";
    const s3Secret = process.env.S3_SECRET || "";
    const maxBytes = 1048576 /* 1MB */ * 2;

    const key = `c/${uuidv4()}`;
    const fileUrl = `https://${s3Bucket}.${s3Endpoint}/${key}`;

    try {
      const s3 = new S3Client({
        endpoint: `https://${s3Endpoint}`,
        region: s3Region,
        credentials: {
          accessKeyId: s3Key,
          secretAccessKey: s3Secret,
        },
      });

      const post = await createPresignedPost(s3, {
        Bucket: s3Bucket,
        Key: key,
        Fields: {
          "Content-Type": "application/pdf",
        },
        Expires: 600, // seconds
        Conditions: [["content-length-range", 0, maxBytes]],
      });

      return {
        post,
        fileUrl,
      };
    } catch (err) {
      throw new TRPCError({
        message: "An error occurred while creating signed url",
        code: "INTERNAL_SERVER_ERROR",
        cause: err,
      });
    }
  }),
});
