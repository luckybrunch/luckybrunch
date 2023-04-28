import { ArrowRightIcon } from "@heroicons/react/outline";
import { useForm, Controller } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button, Label, Select, Form } from "@calcom/ui";

import type { IOnboardingPageProps } from "../../../pages/getting-started/[[...step]]";

interface IUserSettingsProps {
  user: IOnboardingPageProps["user"];
  nextStep: () => void;
}
type FormValues = {
  specializations: number[];
};

const Lb_Specializations = (props: IUserSettingsProps) => {
  const { t } = useLocale();
  const { user, nextStep } = props;
  const utils = trpc.useContext();

  const { data: specializationsSet } = trpc.public.getSpecializations.useQuery();

  const specializationsOptions =
    specializationsSet?.map((item) => ({
      label: item.label,
      value: String(item.id),
    })) ?? [];

  const defaultValues = {
    specializations: user?.specializations.map((item) => item.id) || [],
  };

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: () => {
      utils.viewer.profile.getSpecializations.invalidate();
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
    nextStep();
  };

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <div className="space-y-6">
        <Controller
          name="specializations"
          control={formMethods.control}
          render={({ field: { value } }) => (
            <>
              <Label className="mt-8 text-gray-900">
                <>{t("lb_specializations_label")}</>
              </Label>
              <Select
                isMulti
                placeholder={t("select")}
                options={specializationsOptions}
                value={value.map((v) => specializationsOptions.find((o) => o.value === String(v)))}
                onChange={(value) => {
                  if (value)
                    formMethods.setValue(
                      "specializations",
                      value
                        .map((v) => v?.value ?? "")
                        .map(Number)
                        .filter(Boolean),
                      {
                        shouldDirty: true,
                      }
                    );
                }}
              />
            </>
          )}
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
