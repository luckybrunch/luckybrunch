import { ArrowRightIcon } from "@heroicons/react/solid";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Specialization } from "@calcom/prisma/client";
import { trpc } from "@calcom/trpc";
import { Button, Form, Loader } from "@calcom/ui";

import { StepCheckbox } from "../components/StepCheckbox";

const GOALS_QUERY_KEY = "goals";

export const UserGoals = (props: IOnboardingComponentProps) => {
  const { data } = trpc.public.getSpecializations.useQuery();
  if (!data) return <Loader />;
  return <UserGoalsForm {...props} data={data} />;
};

const UserGoalsForm = (props: {
  nextStep: IOnboardingComponentProps["nextStep"];
  data: Specialization[];
}) => {
  const { nextStep, data } = props;

  const { t } = useLocale();

  const form = useForm();

  const options = data.map(({ id, label }) => ({
    value: String(id),
    title: label,
  }));

  return (
    <Form
      form={form}
      handleSubmit={async () => {
        nextStep();
      }}>
      <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-2">
        {options.map((userGoal, index) => {
          return (
            <StepCheckbox
              key={index}
              title={userGoal.title}
              value={userGoal.value}
              queryKey={GOALS_QUERY_KEY}
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
