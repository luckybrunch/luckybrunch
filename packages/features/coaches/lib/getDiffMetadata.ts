import { Coach } from "@prisma/client";

import { TRPCError } from "@trpc/server";

export type ComparableCoachField = keyof Pick<
  Coach,
  | "firstName"
  | "lastName"
  | "bio"
  | "companyName"
  | "addressLine1"
  | "addressLine2"
  | "zip"
  | "city"
  | "country"
  | "appointmentTypes"
  | "avatar"
>;

export type FieldDiffMetada = {
  field: ComparableCoachField;
  isNew: boolean;
  isDeleted: boolean;
  oldValue: string;
  newValue: string;
};

export const isEmpty = (value?: string | null) => value == null || value.length === 0;

const getDisplayValue = (field: ComparableCoachField, value: string | null | undefined) => {
  // Hide base64
  if (field === "avatar") {
    return "Image";
  }

  return value ?? "";
};

export const getFieldDiffMetadata = ({
  field,
  publishedProfile,
  draftProfile,
}: {
  field: ComparableCoachField;
  publishedProfile: Coach | null;
  draftProfile: Coach | null;
}): FieldDiffMetada => {
  if (!draftProfile) {
    throw new TRPCError({
      message: "Draft profile has to exist for diff calculation to work",
      code: "NOT_FOUND",
    });
  }

  // If published profile doesn't exist at all, everything's a new addition
  // New addition
  if (!publishedProfile || isEmpty(publishedProfile[field])) {
    return {
      field,
      isNew: true,
      isDeleted: false,
      newValue: getDisplayValue(field, draftProfile[field]),
      oldValue: "",
    };
  }

  // Deletion
  if (isEmpty(draftProfile[field])) {
    return {
      field,
      oldValue: getDisplayValue(field, publishedProfile[field]),
      newValue: getDisplayValue(field, draftProfile[field]),
      isDeleted: true,
      isNew: false,
    };
  }

  // Draft profile is assumed to be the latest state and published profile is the previous state
  // Change
  return {
    field,
    oldValue: getDisplayValue(field, publishedProfile[field]),
    newValue: getDisplayValue(field, draftProfile[field]),
    isDeleted: false,
    isNew: false,
  };
};
