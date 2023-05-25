import { ReviewStatus } from "@prisma/client";
import type { FieldDiffMetada } from "coaches/lib/getDiffMetadata";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { List, Button } from "@calcom/ui";

import { ProfileDiff } from "./ProfileDiff";

export const ProfileDiffList = ({ diffList }: { diffList: FieldDiffMetada[] }) => {
  const { t } = useLocale();
  const { data: user } = useMeQuery();
  const ctx = trpc.useContext();
  const requestReviewMutation = trpc.viewer.coaches.requestReview.useMutation();
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
      <div className="flex flex-row items-center">
        <h2 className="m-4 font-bold capitalize">{t("lb_profile_changes")}</h2>
        <Button
          disabled={user?.coachProfileDraft?.reviewStatus !== ReviewStatus.DRAFT}
          loading={requestReviewMutation.isLoading}
          className="m-2 flex items-center justify-center"
          onClick={() => requestReviewMutation.mutate()}>
          {t("lb_request_review")}
        </Button>
      </div>
      <List className="border-none">
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
