import classNames from "classnames";
import { HiStar } from "react-icons/hi";

import { useLocale } from "@calcom/lib/hooks/useLocale";

const reviews = {
  average: 4,
  totalCount: 1624,
  counts: [
    { rating: 5, count: 1019 },
    { rating: 4, count: 162 },
    { rating: 3, count: 97 },
    { rating: 2, count: 199 },
    { rating: 1, count: 147 },
  ],
};

export function Review() {
  const { t } = useLocale();

  return (
    <section aria-labelledby="Review">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
        <div className="lg:col-span-4">
          <h2 id="timeline-title" className="text-md font-bold text-gray-700">
            Reviews
          </h2>

          <div className="mt-3 flex items-center">
            <div>
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <HiStar
                    key={rating}
                    className={classNames(
                      reviews.average > rating ? "text-brand-400" : "text-gray-300",
                      "h-5 w-5 flex-shrink-0"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="sr-only">
                {t("lb_price_range_value", {
                  number: reviews.average,
                })}
              </p>
            </div>
            <p className="ml-2 text-sm text-gray-500">
              {t("lb_price_range_value", {
                totalReviews: reviews.totalCount,
              })}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">{t("lb_review_data")}</h3>

            <dl className="space-y-3">
              {reviews.counts.map((count) => (
                <div key={count.rating} className="flex items-center text-sm">
                  <dt className="flex flex-1 items-center">
                    <p className="font-sm w-3 text-gray-600">
                      {count.rating}
                      <span className="sr-only">{t("lb_star_reviews")}</span>
                    </p>
                    <div aria-hidden="true" className="ml-1 flex flex-1 items-center">
                      <HiStar
                        className={classNames(
                          count.count > 0 ? "text-brand-400" : "text-gray-300",
                          "h-5 w-5 flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />

                      <div className="relative ml-3 flex-1">
                        <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                        {count.count > 0 ? (
                          <div
                            className="border-brand-400 bg-brand-400 absolute inset-y-0 rounded-full border"
                            style={{
                              width: `calc(${count.count} / ${reviews.totalCount} * 100%)`,
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </dt>
                  <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-600">
                    {Math.round((count.count / reviews.totalCount) * 100)}%
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10">
            <h3 className="text-md font-bold text-gray-700">{t("lb_share_thoughts_title")}</h3>
            <p className="mt-1 text-sm text-gray-800">
            {t("lb_share_thoughts_text")}
            </p>

            <a
              href="#"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:w-auto lg:w-full">
              Write a review
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
