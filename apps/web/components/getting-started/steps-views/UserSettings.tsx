import { ArrowRightIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import { trpc } from "@calcom/trpc/react";
import { Button, Form, TimezoneSelect } from "@calcom/ui";

import { UsernameAvailabilityField } from "@components/ui/UsernameAvailability";

import type { IOnboardingPageProps } from "../../../pages/getting-started/[[...step]]";

interface IUserSettingsProps {
  user: IOnboardingPageProps["user"];
  nextStep: () => void;
}

type FormValues = {
  firstName: string;
  lastName: string;
};

const UserSettings = (props: IUserSettingsProps) => {
  const { user, nextStep } = props;
  const { t } = useLocale();
  const [selectedTimeZone, setSelectedTimeZone] = useState(dayjs.tz.guess());

  const telemetry = useTelemetry();

  const {
    register,
    formState: { errors, ...formStateRest },
    ...form
  } = useForm<FormValues>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
    reValidateMode: "onChange",
  });

  useEffect(() => {
    telemetry.event(telemetryEventTypes.onboardingStarted);
  }, [telemetry]);

  const defaultOptions = { required: true, maxLength: 255 };

  const utils = trpc.useContext();

  const onSuccess = async () => {
    await utils.viewer.me.invalidate();
    nextStep();
  };

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: onSuccess,
  });

  const onSubmit = (data: FormValues) => {
    form.clearErrors();
    mutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      timeZone: selectedTimeZone,
    });
  };

  return (
    <Form form={{ register, formState: { errors, ...formStateRest }, ...form }} handleSubmit={onSubmit}>
      <div className="space-y-6">
        {/* Username textfield */}
        <UsernameAvailabilityField user={user} />

        {/* First name textfield */}
        <div className="w-full">
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
            {t("firstName")}
          </label>
          <input
            {...register("firstName", defaultOptions)}
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            className="w-full rounded-md border border-gray-300 text-sm"
          />
          {errors.firstName && (
            <p data-testid="required" className="py-2 text-xs text-red-500">
              {t("required")}
            </p>
          )}
        </div>
        {/* Last name textfield */}
        <div className="w-full">
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
            {t("lb_last_name")}
          </label>
          <input
            {...register("lastName", defaultOptions)}
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            className="w-full rounded-md border border-gray-300 text-sm"
          />
          {errors.lastName && (
            <p data-testid="required" className="py-2 text-xs text-red-500">
              {t("required")}
            </p>
          )}
        </div>
        {/* Timezone select field */}
        <div className="w-full">
          <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
            {t("timezone")}
          </label>

          <TimezoneSelect
            id="timeZone"
            value={selectedTimeZone}
            onChange={({ value }) => setSelectedTimeZone(value)}
            className="mt-2 w-full rounded-md text-sm"
          />

          <p className="mt-3 flex flex-row font-sans text-xs leading-tight text-gray-500 dark:text-white">
            {t("current_time")} {dayjs().tz(selectedTimeZone).format("LT").toString().toLowerCase()}
          </p>
        </div>
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

export { UserSettings };
