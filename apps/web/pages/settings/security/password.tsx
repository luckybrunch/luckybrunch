import { IdentityProvider } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import { getLayout } from "@calcom/features/settings/layouts/SettingsLayout";
import { identityProviderNameMap } from "@calcom/lib/auth";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { userMetadata } from "@calcom/prisma/zod-utils";
import { trpc } from "@calcom/trpc/react";
import { Alert, Button, Form, Meta, PasswordField, Select, SettingsToggle, showToast } from "@calcom/ui";

import { ssrInit } from "@server/lib/ssr";

type ChangePasswordSessionFormValues = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
  sessionTimeout?: number;
  apiError: string;
};

const PasswordView = () => {
  const { data } = useSession();
  const { t } = useLocale();
  const utils = trpc.useContext();
  const { data: user } = trpc.viewer.me.useQuery();
  const metadata = userMetadata.parse(user?.metadata);

  const sessionMutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: () => {
      showToast(t("session_timeout_changed"), "success");
      formMethods.reset(formMethods.getValues());
    },
    onSettled: () => {
      utils.viewer.me.invalidate();
    },
    onMutate: async ({ metadata }) => {
      await utils.viewer.me.cancel();
      const previousValue = utils.viewer.me.getData();
      const previousMetadata = userMetadata.parse(previousValue?.metadata);

      if (previousValue && metadata?.sessionTimeout) {
        utils.viewer.me.setData(undefined, {
          ...previousValue,
          metadata: { ...previousMetadata, sessionTimeout: metadata?.sessionTimeout },
        });
      }
      return { previousValue };
    },
    onError: (error, _, context) => {
      if (context?.previousValue) {
        utils.viewer.me.setData(undefined, context.previousValue);
      }
      showToast(`${t("session_timeout_change_error")}, ${error.message}`, "error");
    },
  });
  const passwordMutation = trpc.viewer.auth.changePassword.useMutation({
    onSuccess: () => {
      showToast(t("password_has_been_changed"), "success");
      formMethods.resetField("oldPassword");
      formMethods.resetField("newPassword");
      formMethods.resetField("newPasswordConfirmation");

      if (data?.user.role === "INACTIVE_ADMIN") {
        /*
      AdminPasswordBanner component relies on the role returned from the session.
      Next-Auth doesn't provide a way to revalidate the session cookie,
      so this a workaround to hide the banner after updating the password.
      discussion: https://github.com/nextauthjs/next-auth/discussions/4229
      */
        signOut({ callbackUrl: "/auth/login" });
      }
    },
    onError: (error) => {
      showToast(`${t("error_updating_password")}, ${t(error.message)}`, "error");

      formMethods.setError("apiError", {
        message: t(error.message),
        type: "custom",
      });
    },
  });

  const formMethods = useForm<ChangePasswordSessionFormValues>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
      sessionTimeout: metadata?.sessionTimeout,
    },
  });

  const sessionTimeoutWatch = formMethods.watch("sessionTimeout");

  const handleSubmit = (values: ChangePasswordSessionFormValues) => {
    const { oldPassword, newPassword, sessionTimeout } = values;
    if (oldPassword && newPassword) {
      passwordMutation.mutate({ oldPassword, newPassword });
    }
    if (metadata?.sessionTimeout !== sessionTimeout) {
      sessionMutation.mutate({ metadata: { ...metadata, sessionTimeout } });
    }
  };

  const timeoutOptions = [5, 10, 15].map((mins) => ({
    label: t("multiple_duration_mins", { count: mins }),
    value: mins,
  }));

  const isDisabled = formMethods.formState.isSubmitting || !formMethods.formState.isDirty;

  const passwordMinLength = data?.user.role === "USER" ? 7 : 15;
  const isUser = data?.user.role === "USER";
  return (
    <>
      <Meta title={t("password")} description={t("password_description")} />
      {user && user.identityProvider !== IdentityProvider.CAL ? (
        <div>
          <div className="mt-6">
            <h2 className="font-cal text-lg font-medium leading-6 text-gray-900">
              {t("account_managed_by_identity_provider", {
                provider: identityProviderNameMap[user.identityProvider],
              })}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t("account_managed_by_identity_provider_description", {
              provider: identityProviderNameMap[user.identityProvider],
            })}
          </p>
        </div>
      ) : (
        <Form form={formMethods} handleSubmit={handleSubmit}>
          {formMethods.formState.errors.apiError && (
            <div className="pb-6">
              <Alert severity="error" message={formMethods.formState.errors.apiError?.message} />
            </div>
          )}

          <div className="grid max-w-[38rem] gap-y-2 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <PasswordField
                {...formMethods.register("oldPassword")}
                label={t("old_password")}
                autoComplete="current-password"
              />
            </div>
            <div />
            <div>
              <PasswordField
                {...formMethods.register("newPassword", {
                  minLength: {
                    message: t(isUser ? "password_hint_min" : "password_hint_admin_min"),
                    value: passwordMinLength,
                  },
                  pattern: {
                    message: "Should contain a number, uppercase and lowercase letters",
                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).*$/gm,
                  },
                })}
                label={t("new_password")}
                autoCapitalize="new-password"
              />
            </div>
            <div>
              <PasswordField
                {...formMethods.register("newPasswordConfirmation", {
                  validate: (value) =>
                    value === formMethods.getValues("newPassword") || t("invalid_password_confirmation"),
                })}
                label={t("new_password_2")}
                autoCapitalize="new-password"
              />
            </div>
          </div>
          <p className="mt-4 max-w-[38rem] text-sm text-gray-600">
            {t("invalid_password_hint", { passwordLength: passwordMinLength })}
          </p>
          <div className="mt-8 border-t border-gray-200 py-8">
            <SettingsToggle
              title={t("session_timeout")}
              description={t("session_timeout_description")}
              checked={sessionTimeoutWatch !== undefined}
              data-testid="session-check"
              onCheckedChange={(e) => {
                if (!e) {
                  formMethods.setValue("sessionTimeout", undefined, { shouldDirty: true });
                } else {
                  formMethods.setValue("sessionTimeout", 10, { shouldDirty: true });
                }
              }}
            />
            {sessionTimeoutWatch && (
              <div className="mt-4 text-sm">
                <div className="flex items-center">
                  <p className="text-neutral-900 ltr:mr-2 rtl:ml-2">{t("session_timeout_after")}</p>
                  <Select
                    options={timeoutOptions}
                    defaultValue={
                      metadata?.sessionTimeout
                        ? timeoutOptions.find((tmo) => tmo.value === metadata.sessionTimeout)
                        : timeoutOptions[1]
                    }
                    isSearchable={false}
                    className="block h-[36px] !w-auto min-w-0 flex-none rounded-md text-sm"
                    onChange={(event) => {
                      formMethods.setValue("sessionTimeout", event?.value, { shouldDirty: true });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* TODO: Why is this Form not submitting? Hacky fix but works */}
          <Button
            color="primary"
            className="mt-8"
            type="submit"
            disabled={isDisabled || passwordMutation.isLoading || sessionMutation.isLoading}>
            {t("update")}
          </Button>
        </Form>
      )}
    </>
  );
};

PasswordView.getLayout = getLayout;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const ssr = await ssrInit(context);

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

export default PasswordView;
