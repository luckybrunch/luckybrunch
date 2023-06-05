import { ReviewStatus } from "@prisma/client";
import { UserType } from "@prisma/client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { TopBanner } from "@calcom/ui";

export default function ReviewStatusBanner() {
  const { data: user } = useMeQuery();
  const { data: profileDiff } = trpc.viewer.coaches.getProfileDiff.useQuery(undefined, {
    enabled: user?.userType === UserType.COACH,
  });

  const { t } = useLocale();

  const banner = (() => {
    let title = "";
    let shouldDisplay = false;
    let variant: "default" | "warning" | "error" = "default";

    if (!user || !user.coachProfileDraft) {
      return {
        shouldDisplay,
        title,
        variant,
      };
    }

    const { coachProfileDraft } = user;

    if (
      profileDiff &&
      profileDiff.diffList.length > 0 &&
      coachProfileDraft.reviewStatus === ReviewStatus.DRAFT
    ) {
      title = t("lb_review_status_banner_contains_changes");
      shouldDisplay = true;
    }

    if (coachProfileDraft.rejectionReason && coachProfileDraft.reviewStatus === ReviewStatus.DRAFT) {
      const { rejectionReason } = coachProfileDraft;
      const maxCharCount = 40;

      title = t("lb_review_status_banner_rejection", {
        rejectionReason:
          rejectionReason?.length <= maxCharCount
            ? rejectionReason
            : `${rejectionReason.slice(0, maxCharCount)}...`,
      });
      variant = "error";
      shouldDisplay = true;
    }

    if (coachProfileDraft.reviewStatus === ReviewStatus.REVIEW_REQUESTED) {
      title = t("lb_review_status_banner_review_requested");
      shouldDisplay = true;
    }

    if (coachProfileDraft.reviewStatus === ReviewStatus.REVIEW_STARTED) {
      title = t("lb_review_status_banner_in_review");
      shouldDisplay = true;
    }

    return {
      shouldDisplay,
      title,
      variant,
    };
  })();

  if (banner.shouldDisplay) {
    return (
      <>
        <TopBanner text={banner.title} variant={banner.variant} />
      </>
    );
  }

  return null;
}
