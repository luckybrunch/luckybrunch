import { ArrowRightIcon } from "@heroicons/react/solid";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui";

import { StepCheckbox, useCheckboxOptions } from "../components/StepCheckbox";

export const UserGoals = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;

  const { t } = useLocale();
  const { handleSubmit } = useForm();

  const { options, toggleSelection } = useCheckboxOptions([
    { title: "change weight" },
    { title: "promote health" },
    { title: "improve fitness" },
    { title: "alleviate intolerances" },
  ]);

  const onSubmit = handleSubmit(() => {
    nextStep?.();
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap justify-center">
        {options.map((userGoal, index) => {
          return (
            <StepCheckbox
              key={index}
              isActive={userGoal._isSelected}
              title={userGoal.title}
              toggle={() => toggleSelection(userGoal._id)}
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
