import { ArrowRightIcon } from "@heroicons/react/solid";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui";

import { StepCheckbox, useCheckboxOptions } from "../components/StepCheckbox";

export const MeetingOptions = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;

  const { t } = useLocale();
  const { options, toggleSelection } = useCheckboxOptions([
    { title: "online", inPerson: false },
    { title: "at home", inPerson: true },
    { title: "in the office", inPerson: true },
  ]);

  const { handleSubmit } = useForm();

  const onSubmit = handleSubmit(() => {
    const inPerson = options.filter((o) => o.inPerson).length > 0;
    nextStep?.({ inPerson });
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
