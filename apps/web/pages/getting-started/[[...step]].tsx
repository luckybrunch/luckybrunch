import { UserType } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { ParsedUrlQueryInput, stringify } from "querystring";
import { FC } from "react";
import { z } from "zod";

import { AppointmentType } from "@calcom/features/coaches/types";
import { getSession } from "@calcom/lib/auth";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import prisma from "@calcom/prisma";
import { trpc } from "@calcom/trpc/react";
import { Button, StepCard, Steps } from "@calcom/ui";

import { inferSSRProps } from "@lib/types/inferSSRProps";

import { ClientLocation } from "@components/getting-started/steps-views/ClientLocation";
import Lb_AlmostDone from "@components/getting-started/steps-views/Lb_AlmostDone";
import { Lb_CompanyInfo } from "@components/getting-started/steps-views/Lb_CompanyInfo";
import { Lb_Specializations } from "@components/getting-started/steps-views/Lb_Specializations";
import Lb_UserProfile from "@components/getting-started/steps-views/Lb_UserProfile";
import { MeetingOptions } from "@components/getting-started/steps-views/MeetingOptions";
import { MeetingRange } from "@components/getting-started/steps-views/MeetingRange";
import { PriceRange } from "@components/getting-started/steps-views/PriceRange";
import { SetupAvailability } from "@components/getting-started/steps-views/SetupAvailability";
import { UserGoals } from "@components/getting-started/steps-views/UserGoals";

export type IOnboardingPageProps = inferSSRProps<typeof getServerSideProps>;
export type IOnboardingComponentProps = {
  user: IOnboardingPageProps["user"];
  nextStep: (queryParams?: ParsedUrlQueryInput) => void;
};
export type OnboardingUrl = (typeof availableUrls)[number];

type StepLink = {
  [key in OnboardingUrl]: {
    next: OnboardingUrl | ((queryParams: ParsedUrlQueryInput) => OnboardingUrl | null) | null;
  };
};

const stepLinks: StepLink = {
  "lb_user-profile": {
    next: "lb_company-info",
  },
  "lb_company-info": {
    next: "lb_specializations",
  },
  lb_specializations: {
    next: "lb_setup-availability",
  },
  "lb_user-goals": {
    next: "lb_meeting-options",
  },
  "lb_where-do-you-live": {
    next: "lb_meeting-range",
  },
  "lb_meeting-range": {
    next: "lb_price-range",
  },
  "lb_setup-availability": {
    next: "lb_almost-done",
  },
  "lb_meeting-options": {
    next: (params) => {
      const inPerson =
        [AppointmentType.OFFICE, AppointmentType.HOME].filter((meetingType) =>
          (params.meetingOptions as string[])?.includes(meetingType)
        ).length > 0;

      if (inPerson) {
        return "lb_where-do-you-live";
      }

      return "lb_price-range";
    },
  },
  "lb_price-range": {
    next: null,
  },
  "lb_almost-done": {
    next: null,
  },
};

type TranslationPlaceholder = {
  translationKey: string;
  params?: {
    [key: string]: string;
  };
};

type Step = {
  url: OnboardingUrl;
  headers: {
    title: TranslationPlaceholder;
    skipText?: TranslationPlaceholder;
    subtitle: TranslationPlaceholder[];
  };
};

const availableUrls = [
  "lb_user-profile",
  "lb_company-info",
  "lb_specializations",
  "lb_almost-done",
  "lb_user-goals",
  "lb_meeting-options",
  "lb_where-do-you-live",
  "lb_meeting-range",
  "lb_price-range",
  "lb_setup-availability",
] as const;

const clientUrls: OnboardingUrl[] = [
  "lb_user-goals",
  "lb_meeting-options",
  "lb_where-do-you-live",
  "lb_meeting-range",
  "lb_price-range",
];
const coachUrls: OnboardingUrl[] = [
  "lb_user-profile",
  "lb_company-info",
  "lb_specializations",
  "lb_setup-availability",
  "lb_almost-done",
];

const components: Record<OnboardingUrl, FC<IOnboardingComponentProps>> = {
  "lb_user-profile": Lb_UserProfile,
  "lb_company-info": Lb_CompanyInfo,
  lb_specializations: Lb_Specializations,
  "lb_almost-done": Lb_AlmostDone,
  "lb_user-goals": UserGoals,
  "lb_meeting-options": MeetingOptions,
  "lb_where-do-you-live": ClientLocation,
  "lb_meeting-range": MeetingRange,
  "lb_price-range": PriceRange,
  "lb_setup-availability": SetupAvailability,
};

const availableSteps: Step[] = [
  {
    url: "lb_user-profile",
    headers: {
      title: { translationKey: "welcome_to_cal_header", params: { appName: APP_NAME } },
      subtitle: [
        { translationKey: "we_just_need_basic_info" },
        { translationKey: "edit_form_later_subtitle" },
      ],
    },
  },
  {
    url: "lb_company-info",
    headers: {
      title: { translationKey: "lb_work_info_onboarding" },
      subtitle: [{ translationKey: "lb_work_info_instructions_onboarding" }],
      skipText: { translationKey: "lb_work_info_later_onboarding" },
    },
  },
  {
    url: "lb_specializations",
    headers: {
      title: { translationKey: "lb_specialization_onboarding" },
      subtitle: [
        { translationKey: "lb_set_specialization_onboarding_subtitle_1" },
        { translationKey: "lb_set_specialization_onboarding_subtitle_2" },
      ],
    },
  },
  {
    url: "lb_almost-done",
    headers: {
      title: { translationKey: "nearly_there" },
      subtitle: [{ translationKey: "lb_almost_done_instructions" }],
    },
  },
  {
    url: "lb_user-goals",
    headers: {
      title: { translationKey: "What are you interested in?" },
      subtitle: [{ translationKey: "What would you like to achieve?" }],
    },
  },
  {
    url: "lb_meeting-options",
    headers: {
      title: { translationKey: "Where would you like to meet with your coach" },
      subtitle: [{ translationKey: "Select your prefered way of meeting your coach" }],
    },
  },
  {
    url: "lb_where-do-you-live",
    headers: {
      title: { translationKey: "Where do you live?" },
      subtitle: [{ translationKey: "Provide your location to help us find the best match for you" }],
    },
  },
  {
    url: "lb_meeting-range",
    headers: {
      title: { translationKey: "Prefered distance range" },
      subtitle: [{ translationKey: "What's the maximum distance that you'd want us to match you" }],
    },
  },
  {
    url: "lb_price-range",
    headers: {
      title: { translationKey: "Price range" },
      subtitle: [{ translationKey: "Your prefered price range for coaches" }],
    },
  },
  {
    url: "lb_setup-availability",
    headers: {
      title: { translationKey: "Set up your prefered times for meetings" },
      subtitle: [
        { translationKey: "Make your available times known to clients who want to book an appointment" },
      ],
    },
  },
];

const getStep = (stepUrl: string) => availableSteps.find((s) => s.url === stepUrl);

const coachOnboardingSteps = coachUrls.map(getStep).filter(Boolean) as Step[];
const clientOnboardingSteps = clientUrls.map(getStep).filter(Boolean) as Step[];

const stepTransform = (step: Step, allSteps: Step[]) => {
  const stepIndex = allSteps.findIndex((s) => s.url === step.url);
  if (stepIndex > -1) {
    return allSteps[stepIndex].url;
  }

  return allSteps[0].url;
};

const stepRouteSchema = z.object({ step: z.array(z.enum(availableUrls)) });

const OnboardingPage = (props: IOnboardingPageProps) => {
  const router = useRouter();

  const { user, steps } = props;
  const { t } = useLocale();
  const utils = trpc.useContext();
  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async () => {
      let url;

      if (user?.userType === UserType.COACH) {
        url = "/";
      } else {
        url = "/search";
      }

      await utils.viewer.me.refetch();
      router.push({ pathname: url, query: { ...router.query } });
    },
  });

  const [firstStep] = steps;
  const result = stepRouteSchema.safeParse(router.query);
  const currentUrl = result.success ? result.data.step[0] : firstStep.url;

  const goToIndex = (index: number) => {
    const newStep = steps[index];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    const { step, ...rest } = router.query;
    router.push(
      {
        pathname: `/getting-started/${stepTransform(newStep, steps)}`,
        query: {
          ...rest,
        },
      },
      undefined
    );
  };

  const goToNextStep = async (currentStepIndex: number, newParams?: ParsedUrlQueryInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    const { step, ...previousParams } = router.query;
    const currentStep = steps[currentStepIndex];
    const { next } = stepLinks[currentStep.url];
    const allParams = { ...previousParams, ...newParams };

    let nextStep: OnboardingUrl | null = null;

    if (typeof next === "function") {
      nextStep = next({ ...allParams } ?? {});
    }

    // Last step if null
    if (next == null && nextStep == null) {
      if (user) {
        mutation.mutate({
          completedOnboarding: true,
        });
      } else {
        router.push({
          pathname: "/search",
          query: { ...allParams },
        });
      }
      return;
    }

    router.push({
      pathname: `/getting-started/${nextStep ?? next}`,
      query: { ...allParams },
    });
  };

  const currentStepIndex = steps.findIndex((s) => s.url === currentUrl);

  const { headers, url } = steps[currentStepIndex];
  const Component = components[url];

  return (
    <div
      className="dark:bg-brand dark:text-brand-contrast min-h-screen text-black"
      data-testid="onboarding"
      key={router.asPath}>
      <Head>
        <title>
          {APP_NAME} - {t("getting_started")}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto px-4 py-6 md:py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-[520px]">
              <header>
                <p className="font-cal mb-3 text-[28px] font-medium leading-7">
                  {t(headers.title.translationKey, { ...(headers.title.params && headers.title.params) }) ||
                    "Undefined title"}
                </p>

                {headers.subtitle.map((subtitle, index) => (
                  <p className="font-sans text-sm font-normal text-gray-500" key={index}>
                    {t(subtitle.translationKey, { ...(subtitle.params && subtitle.params) })}
                  </p>
                ))}
              </header>
              <Steps maxSteps={steps.length} currentStep={currentStepIndex + 1} navigateToStep={goToIndex} />
            </div>
            <StepCard>
              <Component user={user} nextStep={(q) => goToNextStep(currentStepIndex, q)} />
            </StepCard>
            {headers.skipText && (
              <div className="flex w-full flex-row justify-center">
                <Button
                  color="minimal"
                  data-testid="skip-step"
                  onClick={(event) => {
                    event.preventDefault();
                    goToIndex(currentStepIndex + 1);
                  }}
                  className="mt-8 cursor-pointer px-4 py-2 font-sans text-sm font-medium">
                  {t(headers.skipText.translationKey, {
                    ...(headers.skipText.params && headers.skipText.params),
                  })}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const crypto = await import("crypto");
  const session = await getSession(context);

  const user = !session
    ? null
    : await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          timeZone: true,
          weekStart: true,
          hideBranding: true,
          theme: true,
          brandColor: true,
          darkBrandColor: true,
          metadata: true,
          timeFormat: true,
          allowDynamicBooking: true,
          defaultScheduleId: true,
          completedOnboarding: true,
          id: true,
          userType: true,
          coachProfileDraft: {
            select: {
              companyName: true,
              name: true,
              bio: true,
              addressLine1: true,
              zip: true,
              city: true,
              appointmentTypes: true,
              specializations: true,
            },
          },
        },
      });

  const destination = user?.userType === UserType.COACH ? "/dashboard" : "/search";

  if (user?.completedOnboarding) {
    return { redirect: { permanent: false, destination: `${destination}?${stringify(context.query)}` } };
  }

  const steps = user?.userType === UserType.COACH ? coachOnboardingSteps : clientOnboardingSteps;
  const currentlyAllowedUrls = steps.map((s) => s.url);

  try {
    const {
      step: [s],
    } = stepRouteSchema.parse(context.query);

    if (!currentlyAllowedUrls.includes(s)) {
      return {
        notFound: true,
      };
    }
  } catch {
    // It can also land here in case user navigates to /getting-started
    // If it fails to parse and still context.query.step isn't empty, then it's an invalid page
    if (context.query.step != null) {
      return {
        notFound: true,
      };
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "", ["common"])),
      user: user
        ? {
            ...user,
            emailMd5: crypto.createHash("md5").update(user.email).digest("hex"),
          }
        : null,
      steps,
    },
  };
};

export default OnboardingPage;
