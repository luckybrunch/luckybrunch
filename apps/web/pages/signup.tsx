import { WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HeadSeo } from "@calcom/ui";

export default function RoleSelection() {
  const { t } = useLocale();

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

        <div className="mx-auto w-full  max-w-sm rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="max-w-0.5 mx-auto mt-10 overflow-hidden rounded-xl bg-white shadow-md sm:max-w-2xl">
            <div className="md:flex">
              <div className="p-8">
                <div className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Coach</div>
                <a
                  href={`${WEBSITE_URL}/signup/coach`}
                  className="mt-1 block text-lg font-medium leading-tight text-black hover:underline">
                  I am an experienced diet coach and I would like to help other people achieve their body
                  goals
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-0.5 mx-auto mt-10 overflow-hidden rounded-xl bg-white shadow-md sm:max-w-2xl">
            <div className="md:flex">
              <div className="p-8">
                <div className="text-sm font-semibold uppercase tracking-wide text-indigo-500">User</div>
                <a
                  href={`${WEBSITE_URL}/signup/customer`}
                  className="mt-1 block text-lg font-medium leading-tight text-black hover:underline">
                  I want to change my body and looking for professional help
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
