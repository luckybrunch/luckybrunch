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
    </Form>
  );
};

export default Lb_AlmostDone;
