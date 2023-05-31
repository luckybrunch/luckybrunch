import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui";

import type { IOnboardingComponentProps } from "../../../pages/getting-started/[[...step]]";

const Lb_AlmostDone = (props: IOnboardingComponentProps) => {
  const { t } = useLocale();
  const { handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const telemetry = useTelemetry();

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async (_data) => {
      router.push("/");
    },
  });

  const onSubmit = handleSubmit(() => {
    telemetry.event(telemetryEventTypes.onboardingFinished);
    mutation.mutate({
      completedOnboarding: true,
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col items-center justify-start rtl:justify-end">
        <li>Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
        <li>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua.
        </li>
        <li>
          At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
          sanctus est Lorem ipsum dolor sit amet.
        </li>
        <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
          {t("finish")}
          <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
};

export default Lb_AlmostDone;
