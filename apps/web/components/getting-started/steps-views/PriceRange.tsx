import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { IOnboardingComponentProps } from "pages/getting-started/[[...step]]";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Form, Button, Label } from "@calcom/ui";

type FormData = {
  priceRange: string;
};

export const PriceRange = (props: IOnboardingComponentProps) => {
  const { nextStep } = props;

  const { query } = useRouter();

  const { t } = useLocale();
  const formMethods = useForm<FormData>({
    defaultValues: { priceRange: (query.maxPrice as string) ?? "500" },
  });

  const onSubmit = async () => {
    nextStep({ maxPrice: formMethods.getValues("priceRange") });
  };

  const currentPrice = formMethods.watch("priceRange");
  const formattedPrice =
    currentPrice === "0"
      ? t("lb_free")
      : currentPrice.length > 3
      ? `0 - ${currentPrice.slice(0, 1)},${currentPrice.slice(1)} EUR`
      : `0 - ${currentPrice} EUR`;

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <Label htmlFor="price-range" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {t("lb_price_range_value", {
          price: formattedPrice,
        })}
      </Label>
      <input
        {...formMethods.register("priceRange")}
        id="price-range"
        name="priceRange"
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        step={10}
        min={0}
        max={2000}
      />
      <Button type="submit" className="mt-8 flex w-full flex-row justify-center">
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};
