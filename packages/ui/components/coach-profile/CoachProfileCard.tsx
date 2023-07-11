import { useLocale } from "@calcom/lib/hooks/useLocale";
import { FiEye } from "@calcom/ui/components/icon";

type CoachProfileCard = {
  children: React.ReactNode;
  header: string;
  subheader?: string;
  sectionTitle?: string;
  button?: React.ReactNode;
  viewMore?: boolean;
  headerIcon: React.ReactNode;
};

export function CoachProfileCard(props: CoachProfileCard) {
  const { t } = useLocale();
  const { children, header, subheader, sectionTitle, viewMore, button, headerIcon } = props;
  return (
    <section aria-labelledby={header}>
      <div className="border border-gray-200 bg-white shadow sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-1">
              {headerIcon}
              <h2 className="text-md text-brand-600 font-bold leading-6">{header}</h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{subheader}</p>
          </div>
          {button}
        </div>
        <div className="border-y border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h3 className="mb-2 text-sm font-bold text-gray-700">{sectionTitle}</h3>
              {children}
            </div>
          </dl>
        </div>
        <div>
          {viewMore ? (
            <a
              href="#"
              className="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg">
              <div className="flex items-center justify-center gap-2">
                <FiEye />
                {t("lb_view_more")}
              </div>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
