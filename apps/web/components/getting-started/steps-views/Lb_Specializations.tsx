import { ArrowRightIcon } from "@heroicons/react/outline";
import { Controller, useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button, Label, Combobox, Form } from "@calcom/ui";

import type { IOnboardingComponentProps } from "../../../pages/getting-started/[[...step]]";

type FormValues = {
  specializations: number[];
};

const Lb_Specializations = (props: IOnboardingComponentProps) => {
  const { t } = useLocale();
  const { user, nextStep } = props;
  const utils = trpc.useContext();

  const { data: specializationsSet } = trpc.public.getSpecializations.useQuery();

  const specializationsOptions =
    specializationsSet?.map((item) => ({
      label: item.label,
      value: item.id,
    })) ?? [];

  const defaultValues = {
    specializations: user?.coachProfileDraft?.specializations.map((item) => item.id) || [],
  };

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: () => {
      utils.viewer.me.refetch();
    },
    onError: (error) => {
      throw error;
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      specializations: data.specializations,
    });
    nextStep?.();
  };

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <div className="space-y-6">
        <Controller
          name="specializations"
          control={formMethods.control}
          render={({ field: { value } }) => {
            const selected = specializationsOptions.filter((item) => value.includes(item.value));
            return (
              <>
                <Label className="mt-8 text-gray-900">
                  <>{t("lb_specializations_label")}</>
                </Label>
                <Combobox
                  list={specializationsOptions}
                  selected={selected}
                  setSelected={(v) =>
                    formMethods.setValue(
                      "specializations",
                      v.map((item) => item.value)
                    )
                  }
                />
              </>
            );
          }}
        />
      </div>
      <Button
        type="submit"
        className="mt-8 flex w-full flex-row justify-center"
        disabled={mutation.isLoading}>
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};

export { Lb_Specializations };
