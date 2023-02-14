import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui";
import { FiUpload } from "@calcom/ui/components/icon";

export function SubmitForReviewButton() {
  const { t } = useLocale();
  const { data } = trpc.viewer.profile.getOnboardingFlags.useQuery();

  return (
    <>
      {data?.requestedReviewAt &&
        data?.reviewedAt &&
        data?.reviewedAt.getTime() > data.requestedReviewAt.getTime() &&
        (
          <div className="flex grow justify-end">
            <Button
              // disabled={isDisabled}
              type="submit"
              // loading={mutation.isLoading}
              color="primary"
              className="mt-12"
              StartIcon={FiUpload}>
              {t("lb_submit_for_review")}
            </Button>
          </div>
        )}
    </>
  );
}
