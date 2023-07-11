import Link from "next/link";

import { useLocale } from "@calcom/lib/hooks/useLocale";

import { Button } from "../button";
import { Logo } from "../logo";

type CoachProfileCard = {
  children?: React.ReactNode;
  avatarUrl?: string | null;
  subheader: string;
  header: string | null;
  button: React.ReactNode;
};

export function CoachProfileLayout(props: CoachProfileCard) {
  const { t } = useLocale();
  const { children, avatarUrl, header, subheader, button } = props;

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className=" hidden sm:block">
          <div className="mx-auto flex justify-between px-6 py-3">
            <div className="flex items-center">
              <Link href="/">
                <Logo />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-brand-600 text-sm font-bold">Don&apos;t have an account yet? </p>
              <Button href="/signup/client" color="secondary">
                {t("register")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
          <div className="flex items-center space-x-5">
            {avatarUrl ? (
              <div className="flex-shrink-0">
                <div className="relative block aspect-square h-24 w-24 overflow-hidden rounded-lg border border-gray-200 md:h-32 md:w-32">
                  <img alt={t("lb_profile_image")} src={avatarUrl} className="block h-full w-full" />
                  <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                </div>
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{header}</h1>
              <p className="text-sm text-gray-500">{subheader}</p>
            </div>
          </div>

          <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            {button}
          </div>
        </div>

        {/* COLUMN LAYOUT CONTAINER*/}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
