import { useLocale } from "@calcom/lib/hooks/useLocale";
import { User } from "@calcom/prisma/client";

export default function Information({ user }: { user: Pick<User, "name" | "email"> }) {
  const { t } = useLocale();

  return (
    <article className="border-brand-100 mb-16 rounded-xl border-2 p-7">
      <section>
        <h4 className="capitilize text-lg font-semibold">{t("name")}</h4>
        <div className="mb-6">
          <p className="text-sm font-light">{user?.name}</p>
        </div>

        <div className="mb-6">
          <h5 className="font-semibold capitalize text-gray-600 ">{t("email")}</h5>
          <p className="text-sm font-light">{user?.email}</p>
        </div>
      </section>
    </article>
  );
}
