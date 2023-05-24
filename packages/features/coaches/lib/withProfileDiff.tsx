import { ProfileDiffList } from "../components/ProfileDiffList";
import type { FieldDiffMetada } from "./getDiffMetadata";

export const withProfileDiffList = (Component: React.FC, diffList?: FieldDiffMetada[]) => {
  return (
    <>
      <Component />
      {diffList && diffList.length > 0 && <ProfileDiffList diffList={diffList} />}
    </>
  );
};
