import { ReviewStatus } from "@prisma/client";
import type { FieldDiffMetada } from "coaches/lib/getDiffMetadata";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { Divider } from "@calcom/ui";
import { List, Button } from "@calcom/ui";

import { ProfileDiff } from "./ProfileDiff";

export const ProfileDiffList = ({ diffList }: { diffList: FieldDiffMetada[] }) => {
  const { t } = useLocale();
  const { data: user } = useMeQuery();
  const ctx = trpc.useContext();
  const requestReviewMutation = trpc.viewer.coaches.requestReview.useMutation({
    onSuccess: () => {
      ctx.viewer.me.invalidate();
    },
  });
  const revertChangeMutation = trpc.viewer.coaches.revertProfileChange.useMutation({
    onSuccess: () => {
      ctx.viewer.coaches.getProfileDiff.invalidate();
      ctx.viewer.me.invalidate();
    },
  });

  const revertChange = async (field: string) => {
    revertChangeMutation.mutate({ field });
  };

  return (
    <div className="my-2">
      <Divider className="mt-10" />

      <div className="mb-8 mt-6 flex flex-wrap items-center justify-between gap-8 text-sm">
        <div>
          <p className="font-semibold">{t("lb_profile_changes")}</p>
          <p className="text-gray-500">{`${t("lb_recent_profile_changes")}`}</p>
        </div>
        <div className="flex w-full xl:w-[22%] xl:justify-end">
          <Button
            disabled={user?.coachProfileDraft?.reviewStatus !== ReviewStatus.DRAFT}
            loading={requestReviewMutation.isLoading}
            onClick={() => requestReviewMutation.mutate()}>
            {t("lb_request_review")}
          </Button>
        </div>
      </div>

      <List roundContainer>
        {diffList.map((profileDiff, index) => (
          <ProfileDiff
            isLoading={revertChangeMutation.isLoading}
            key={index}
            revertChange={revertChange}
            diffMetadata={profileDiff}
          />
        ))}
      </List>
    </div>
  );
};
