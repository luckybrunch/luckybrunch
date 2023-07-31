import { ArrowRightIcon } from "@heroicons/react/solid";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import { Button, Form } from "@calcom/ui";

import type { IOnboardingComponentProps } from "../../../pages/getting-started/[[...step]]";

const Lb_AlmostDone = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;
  const { t } = useLocale();
  const form = useForm<FormData>();
  const telemetry = useTelemetry();

  const onSubmit = () => {
    telemetry.event(telemetryEventTypes.onboardingFinished);
    nextStep();
  };

  return (
    <Form form={form} handleSubmit={onSubmit}>
      <div className="flex flex-col items-center justify-start rtl:justify-end">
        <p className="bold my-4 w-full">{t("lb_almost_done_paragraph_1")}</p>
        <p className="bold my-4 w-full">{t("lb_almost_done_paragraph_2")}</p>
        <p className="bold my-4 w-full">{t("lb_almost_done_paragraph_3")}</p>
        <p className="bold text-brand-500 my-4 w-full">{t("lb_almost_done_paragraph_4")}</p>
        <p className="bold my-4 w-full">{t("lb_almost_done_paragraph_5")}</p>
        <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
          {t("finish")}
          <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
        </Button>
      </div>
    </Form>
  );
};

export default Lb_AlmostDone;
