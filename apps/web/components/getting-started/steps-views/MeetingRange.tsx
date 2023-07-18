import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Label, Button, Form } from "@calcom/ui";

type FormData = {
  distance: string;
};

export const MeetingRange = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;
  const { t } = useLocale();

  const { query } = useRouter();

  const formMethods = useForm<FormData>({
    defaultValues: { distance: (query.maxDistance as string) ?? "35" },
  });

  const onSubmit = async () => {
    nextStep({ maxDistance: formMethods.getValues("distance") });
  };

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <Label
        htmlFor="distance-range"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {t("lb_meeting_range_value", { range: formMethods.watch("distance") })}
      </Label>
      <input
        {...formMethods.register("distance")}
        id="distance-range"
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        step={10}
        min={0}
        max={150}
      />
      <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};
