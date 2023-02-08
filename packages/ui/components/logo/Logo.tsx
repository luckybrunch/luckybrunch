import { LOGO_ICON, LOGO } from "@calcom/lib/constants";

export default function Logo({ small, icon }: { small?: boolean; icon?: boolean }) {
  return (
    <h1 className="logo inline">
      <strong>
        {icon ? (
          <img className="mx-auto w-9" alt="LuckyBrunch" title="LuckyBrunch" src={LOGO_ICON} />
        ) : (
          <img
            className={small ? "h-5 w-auto" : "h-5 w-auto"}
            alt="LuckyBrunch"
            title="LuckyBrunch"
            src={LOGO}
          />
        )}
      </strong>
    </h1>
  );
}
