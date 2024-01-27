import { ArrowRightIcon } from "@heroicons/react/solid";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { AppointmentType } from "@calcom/features/coaches/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Form } from "@calcom/ui";

import { StepCheckbox } from "../components/StepCheckbox";

const MEETING_OPTIONS_QUERY_KEY = "meetingOptions";

export const MeetingOptions = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;
  const { t } = useLocale();

  const options = [
    { title: t("lb_appointmenttype_online"), value: AppointmentType.ONLINE },
    { title: t("lb_appointmenttype_home"), value: AppointmentType.HOME },
    { title: t("lb_appointmenttype_office"), value: AppointmentType.OFFICE },
  ];

  const form = useForm();

  return (
    <Form
      form={form}
      handleSubmit={async () => {
        nextStep();
      }}>
      <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-3">
        {options.map((option, index) => {
          return (
            <StepCheckbox
              key={index}
              title={option.title}
              queryKey={MEETING_OPTIONS_QUERY_KEY}
              value={option.value}
            />
          );
        })}
      </div>
      <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};
