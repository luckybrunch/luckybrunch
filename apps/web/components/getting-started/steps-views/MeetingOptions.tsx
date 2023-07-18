import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { AppointmentType } from "@calcom/features/coaches/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui";

import { StepCheckbox, useCheckboxOptions } from "../components/StepCheckbox";

export const MeetingOptions = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;
  const { query } = useRouter();

  const { t } = useLocale();
  const { options, toggleSelection } = useCheckboxOptions(
    (() => {
      return [
        { title: t("lb_appointmenttype_online"), value: AppointmentType.ONLINE },
        { title: t("lb_appointmenttype_home"), value: AppointmentType.HOME },
        { title: t("lb_appointmenttype_office"), value: AppointmentType.OFFICE },
      ].map((o) => ({ ...o, _isSelected: query.meetingOptions?.includes(o.value) }));
    })()
  );

  const { handleSubmit } = useForm();

  const onSubmit = handleSubmit(async () => {
    const params = { meetingOptions: options.filter((o) => o._isSelected).map((o) => o.value) };
    nextStep(params);
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap justify-center">
        {options.map((option, index) => {
          return (
            <StepCheckbox
              key={index}
              isActive={option._isSelected}
              title={option.title}
              toggle={() => toggleSelection(option._id)}
            />
          );
        })}
      </div>
      <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </form>
  );
};
