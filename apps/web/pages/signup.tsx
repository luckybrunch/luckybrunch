import Link from "next/link";

import { WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HeadSeo } from "@calcom/ui";

const personas = [
  {
    key: 1,
    name: "I am a nutritionist",
    role: "Sign up as coach",
    imageUrl: "/coach.jpg",
    websiteUrl: `${WEBSITE_URL}/signup/coach`,
    twitterUrl: "#",
    linkedinUrl: "#",
  },
  {
    key: 2,
    name: "I am searching for a coach",
    role: "Sign up as client",
    imageUrl: "/user.jpg",
    websiteUrl: `${WEBSITE_URL}/signup/costumer`,
    twitterUrl: "#",
    linkedinUrl: "#",
  },
];

export default function RoleSelection() {
  const { t } = useLocale();

  return (
    <>
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-6 lg:px-8"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true">
        <HeadSeo title={t("sign_up")} description={t("sign_up")} />
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="font-cal text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why you should join LuckyBrunch…
          </h2>
          <p className="mt-4 font-sans text-lg text-gray-600 md:mt-6">
            LuckyBrunch is a platform where nutritionists and people seeking support with a healthy diet get
            together.{" "}
            <span className="hidden md:inline">
              Book and organize appointments, communicate with you coach or clients and help build a healthy
              community!
            </span>
          </p>
        </div>
        <ul
          role="list"
          className=" mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:mt-16 lg:mx-0 lg:grid-cols-2">
          {personas.map((persona) => (
            <Link
              href={persona.websiteUrl}
              key={persona.key}
              className="rounded-md border border-gray-200 bg-white p-4 drop-shadow dark:bg-black sm:p-8">
              <li key={persona.name}>
                <img className="aspect-[3/2] w-full rounded-md object-cover" src={persona.imageUrl} alt="" />
                <h3 className="mt-2 font-sans text-lg font-semibold leading-8 tracking-tight text-gray-900 sm:mt-8">
                  {persona.name}
                </h3>
                <p className="font-sans font-sans text-base text-sm font-normal text-gray-500">
                  {persona.role}
                </p>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </>
  );
}
