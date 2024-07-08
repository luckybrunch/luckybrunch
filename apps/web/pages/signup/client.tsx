import type { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { Trans } from "next-i18next";
import { useRouter } from "next/router";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { collectPageParameters, telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import { sessionStorage } from "@calcom/lib/webstorage";
import prisma from "@calcom/prisma";
import { inferSSRProps } from "@calcom/types/inferSSRProps";
import { Alert, Form, Button, EmailField, HeadSeo, PasswordField, TextField } from "@calcom/ui";

import CheckboxField from "@components/ui/form/CheckboxField";

import { asStringOrNull } from "../../lib/asStringOrNull";
import { IS_GOOGLE_LOGIN_ENABLED } from "../../server/lib/constants";
import { ssrInit } from "../../server/lib/ssr";

type FormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordcheck: string;
  apiError: string;
  acceptTerms: boolean;
};

export default function Signup({ prepopulateFormValues }: inferSSRProps<typeof getServerSideProps>) {
  const { t } = useLocale();
  const router = useRouter();
  const telemetry = useTelemetry();

  const methods = useForm<FormValues>({
    defaultValues: prepopulateFormValues,
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const handleErrors = async (resp: Response) => {
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.message);
    }
  };

  const signUp: SubmitHandler<FormValues> = async (data) => {
    methods.clearErrors();
    await fetch("/api/auth/signup?is_client=true", {
      body: JSON.stringify({
        ...data,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then(handleErrors)
      .then(async () => {
        telemetry.event(telemetryEventTypes.signup, collectPageParameters());
        const callbackUrl = sessionStorage.getItem("lb_callback");
        await signIn<"credentials">("credentials", {
          ...data,
          callbackUrl: callbackUrl ? `${WEBAPP_URL}${callbackUrl}` : `${WEBAPP_URL}/search`,
        });
      })
      .catch((err) => {
        methods.setError("apiError", { message: err.message });
      });
  };

  return (
    <>
      <div
        className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true">
        <HeadSeo title={t("sign_up")} description={t("sign_up")} />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="font-cal text-center text-3xl font-extrabold text-gray-900">
            {t("create_your_account")}
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-2 bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <FormProvider {...methods}>
              <Form form={methods} handleSubmit={signUp} className="space-y-6 bg-white">
                {errors.apiError && <Alert severity="error" message={errors.apiError?.message} />}
                <div className="space-y-2">
                  <TextField {...register("firstName")} required label={t("lb_first_name")} />
                  <TextField {...register("lastName")} required label={t("lb_last_name")} />
                  <EmailField
                    {...register("email")}
                    disabled={prepopulateFormValues?.email}
                    className="disabled:bg-gray-200 disabled:hover:cursor-not-allowed"
                  />
                  <PasswordField
                    labelProps={{
                      className: "block text-sm font-medium text-gray-700",
                    }}
                    hint={t("lb_password_hint")}
                    {...register("password")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                  />
                  <PasswordField
                    label={t("confirm_password")}
                    {...register("passwordcheck", {
                      validate: (value) =>
                        value === methods.watch("password") || (t("error_password_mismatch") as string),
                    })}
                  />

                  <p className="pt-4 text-sm">
                    <Trans i18nKey="lb_terms">
                      Please read our
                      <a
                        href="https://luckybrunch.de/agb"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-800 underline">
                        General Terms and Conditions
                      </a>
                      carefully and accept them in order to proceed.
                    </Trans>
                  </p>
                  <CheckboxField description={t("lb_accept_terms")} required {...register("acceptTerms")} />
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button type="submit" loading={isSubmitting} className="w-7/12 justify-center">
                    {t("create_account")}
                  </Button>
                  <Button
                    color="secondary"
                    className="w-5/12 justify-center"
                    onClick={() =>
                      signIn("Cal.com", {
                        callbackUrl: router.query.callbackUrl
                          ? `${WEBAPP_URL}/${router.query.callbackUrl}`
                          : `${WEBAPP_URL}/getting-started`,
                      })
                    }>
                    {t("login")}
                  </Button>
                </div>
              </Form>
            </FormProvider>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const ssr = await ssrInit(ctx);
  const token = asStringOrNull(ctx.query.token);

  const props = {
    isGoogleLoginEnabled: IS_GOOGLE_LOGIN_ENABLED,
    isSAMLLoginEnabled: false,
    trpcState: ssr.dehydrate(),
    prepopulateFormValues: undefined,
  };

  if (process.env.NEXT_PUBLIC_DISABLE_SIGNUP === "true") {
    return {
      notFound: true,
    };
  }

  // no token given, treat as a normal signup without verification token
  if (!token) {
    return {
      props: JSON.parse(JSON.stringify(props)),
    };
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return {
      notFound: true,
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      AND: [
        {
          email: verificationToken?.identifier,
        },
        {
          emailVerified: {
            not: null,
          },
        },
      ],
    },
  });

  if (existingUser) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/login?callbackUrl=" + `${WEBAPP_URL}/${ctx.query.callbackUrl}`,
      },
    };
  }

  return {
    props: {
      ...props,
      prepopulateFormValues: {
        email: verificationToken.identifier,
      },
    },
  };
};
