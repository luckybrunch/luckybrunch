import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui";

import { StepCheckbox, useCheckboxOptions } from "../components/StepCheckbox";

enum Goal {
  CHANGE_WEIGHT = "change_weight",
  PROMOTE_HEALTH = "promote_health",
  IMPROVE_FITNESS = "improve_fitness",
  ALLEVIATE_INTOLERANCES = "alleviate_intolerances",
}

export const UserGoals = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;

  const { t } = useLocale();
  const { handleSubmit } = useForm();
  const { query, push } = useRouter();

  const { options, toggleSelection } = useCheckboxOptions(
    (() => {
      return [
        { value: Goal.CHANGE_WEIGHT, title: "change weight" },
        { value: Goal.PROMOTE_HEALTH, title: "promote health" },
        { value: Goal.IMPROVE_FITNESS, title: "improve fitness" },
        { value: Goal.ALLEVIATE_INTOLERANCES, title: "alleviate intolerances" },
      ].map((o) => ({
        ...o,
        _isSelected: query.goals?.includes(o.value),
      }));
    })()
  );

  const onSubmit = handleSubmit(async () => {
    const params = { goals: options.filter((o) => o._isSelected).map((o) => o.value) };
    await push({ query: { ...query, ...params } });
    nextStep(params);
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
