import { useRouter } from "next/router";

export function useQueryState(key: string) {
  const router = useRouter();
  let v = router.query[key];
  if (!v) v = [];
  else if (!Array.isArray(v)) v = [v];

  const set = (value: string[]) => {
    router.replace(
      {
        query: {
          ...router.query,
          [key]: value,
        },
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  return [v, set] as const;
}
