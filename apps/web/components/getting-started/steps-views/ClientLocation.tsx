import { ArrowRightIcon } from "@heroicons/react/solid";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm, Controller } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Label, Form, Select } from "@calcom/ui";

type FormData = {
  city: string;
};

export const ClientLocation = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;

  const { t } = useLocale();
  const formMethods = useForm<FormData>({ defaultValues: { city: "" } });

  const cities = [
    { label: "Hamburg", value: "hamburg" },
    { label: "Berlin", value: "berlin" },
  ];

  const onSubmit = () => {
    nextStep({ city: formMethods.getValues("city") });
  };

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <div className="space-y-6">
        <Controller
          name="city"
          control={formMethods.control}
          render={() => {
            return (
              <>
                <Label className="mt-8 text-gray-900">
                  <>{t("lb_city")}</>
                </Label>
                <Select
                  placeholder={t("select")}
                  options={cities}
                  onChange={(option) => {
                    if (option)
                      formMethods.setValue("city", option.value, {
                        shouldDirty: true,
                      });
                  }}
                />
              </>
            );
          }}
        />
      </div>
      <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};
