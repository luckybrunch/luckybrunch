import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { classNames } from "@calcom/lib";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Form,
  Rating,
  RatingInput,
  TextAreaField,
} from "@calcom/ui";

export function Reviews({ coachUserId }: { coachUserId: number }) {
  const { t, i18n } = useLocale();
  const utils = trpc.useContext();

  const { data } = trpc.viewer.reviews.getReviews.useQuery({ coachUserId });
  const { data: reviewContext } = trpc.viewer.reviews.getReviewContext.useQuery({ coachUserId });

  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "long",
  });

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { mutate: postReview, isLoading: postReviewLoading } = trpc.viewer.reviews.writeReview.useMutation({
    onSuccess: () => {
      setReviewDialogOpen(false);
      utils.viewer.reviews.getReviews.invalidate();
      utils.viewer.reviews.getReviewContext.invalidate();
    },
  });
  const submitReview = (data: FormValues) => {
    postReview({
      ...data,
      coachUserId,
    });
  };

  return (
    <section aria-labelledby="Review">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
        <div className="lg:col-span-4">
          <h2 id="Review" className="text-lg font-bold text-gray-700">
            {t("lb_reviews")}
          </h2>

          <div className="mt-3 flex items-center">
            {data ? (
              <div className="flex items-center">
                <Rating rating={data.rating} size="lg" />
                <span className="ml-2 text-sm text-gray-500">
                  {data.rating.toFixed(1)} ({t("lb_review", { count: data.reviewCount })})
                </span>
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>

          {reviewContext?.canReview ? (
            <div className="mt-6">
              <h3 className="text-base font-bold text-gray-700">{t("lb_share_thoughts_title")}</h3>
              <p className="mt-1 text-sm text-gray-800">{t("lb_share_thoughts_text")}</p>
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button color="secondary" className="mt-3">
                    {reviewContext.review ? t("lb_edit_review_action") : t("lb_write_review_action")}
                  </Button>
                </DialogTrigger>
                <DialogContent title={t("lb_write_review_dialog_title")} type="creation">
                  <ReviewForm
                    onSubmit={submitReview}
                    loading={postReviewLoading}
                    defaultValues={
                      reviewContext.review
                        ? {
                            rating: reviewContext.review.rating,
                            comment: reviewContext.review.comment ?? "",
                          }
                        : undefined
                    }
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : null}

          {data ? (
            <div>
              {data.reviews.map((review, reviewIdx) => (
                <div
                  key={review.id}
                  className={classNames(
                    "flex-1 py-6 text-sm text-gray-500",
                    reviewIdx === 0 ? "" : "border-t border-gray-200"
                  )}>
                  <h3 className="font-medium text-gray-900">{review.user.firstName}</h3>
                  <p>
                    <time dateTime={review.createdAt.toISOString().split("T")[0]}>
                      {dateFormat.format(review.createdAt)}
                    </time>
                  </p>

                  <div className="mt-2 flex items-center">
                    <Rating rating={review.rating} />
                  </div>
                  <p className="sr-only">{t("lb_out_of_stars", { number: review.rating })}</p>

                  {review.comment ? (
                    <div className="prose prose-sm mt-2 max-w-none text-gray-500">
                      <p>{review.comment}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40" />
          )}
        </div>
      </div>
    </section>
  );
}

type FormValues = {
  rating: number;
  comment: string;
};

function ReviewForm({
  onSubmit,
  loading,
  defaultValues,
}: {
  onSubmit: (data: FormValues) => void;
  loading: boolean;
  defaultValues?: FormValues;
}) {
  const { t } = useLocale();

  const form = useForm<FormValues>({
    defaultValues,
  });

  return (
    <Form form={form} handleSubmit={onSubmit}>
      <div className="flex flex-col items-center">
        <Controller
          name="rating"
          rules={{ required: true }}
          control={form.control}
          render={({ field, fieldState }) => (
            <div
              className={classNames(
                "rounded-full border-2 border-transparent p-2",
                fieldState.error && "border-red-700"
              )}>
              <RatingInput value={field.value} onValueChange={(v) => field.onChange(v)} />
            </div>
          )}
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          labelProps={{ className: "sr-only" }}
          rows={4}
          label={t("lb_review_comment")}
          placeholder={t("lb_review_comment_placeholder")}
          {...form.register("comment")}
        />
      </div>

      <DialogFooter>
        <DialogClose>{t("cancel")}</DialogClose>
        <Button color="primary" type="submit" loading={loading}>
          {t("lb_review_post")}
        </Button>
      </DialogFooter>
    </Form>
  );
}
