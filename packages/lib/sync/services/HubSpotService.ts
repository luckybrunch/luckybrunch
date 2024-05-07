import logger from "@calcom/lib/logger";
import prisma from "@calcom/prisma";

import HubSpot from "../../HubSpot";
import ISyncService, { ConsoleUserInfoType, WebUserInfoType } from "../ISyncService";
import SyncServiceCore from "../ISyncService";

// HubSpot Contact Fields
const hubspotProperties = {
  email: "email",
  firstName: "firstname",
  lastName: "lastname",
  companyName: "company",
  address: "address",
  zip: "zip",
  city: "city",
  // Custom Fields
  contactGroup: "kontaktgruppe",
  bio: "beschreibung",
  username: "benutzername",
  appointmentTypes: "terminarten",
  specializations: "fachgebiete",
} as const;

const serviceName = "hubspot_service";

export default class HubSpotService extends SyncServiceCore implements ISyncService {
  protected declare service: HubSpot;
  constructor() {
    super(serviceName, HubSpot, logger.getChildLogger({ prefix: [`[[sync] ${serviceName}`] }));
  }

  upsert = async (user: WebUserInfoType | ConsoleUserInfoType) => {
    this.log.debug("sync:hubspot:user", user);
    // Preparing Contact Properties data for HubSpot
    const data = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { coachProfileDraft: { include: { specializations: true } } },
    });
    const contactData = {
      [hubspotProperties.email]: data.email,
      [hubspotProperties.firstName]: data.firstName ?? "",
      [hubspotProperties.lastName]: data.lastName ?? "",
      [hubspotProperties.companyName]: data.coachProfileDraft?.companyName ?? "",
      [hubspotProperties.address]: [
        data.coachProfileDraft?.addressLine1,
        data.coachProfileDraft?.addressLine2,
      ]
        .filter(Boolean)
        .join("\n"),
      [hubspotProperties.zip]: data.coachProfileDraft?.zip ?? "",
      [hubspotProperties.city]: data.coachProfileDraft?.city ?? "",
      // Custom Fields
      [hubspotProperties.contactGroup]: data.userType === "COACH" ? "Coach" : "Patient",
      [hubspotProperties.bio]: data.bio ?? "",
      [hubspotProperties.username]: data.username ?? "",
      [hubspotProperties.appointmentTypes]:
        data.coachProfileDraft?.appointmentTypes?.split(",").join(";") ?? "",
      [hubspotProperties.specializations]:
        data.coachProfileDraft?.specializations?.map((s) => s.label).join("\n") ?? "",
    };
    this.log.debug("sync:hubspot:contact:contactData", contactData);
    // Get HubSpot Contact ID
    const contactId = await this.service.getHubSpotContactId(user.email);
    this.log.debug("sync:hubspot:contact:contactId", contactId);
    // Update or Create Contact in HubSpot
    if (contactId) {
      await this.service.updateContact(contactId, contactData);
    } else {
      await this.service.createContact(contactData);
    }
    this.log.debug("sync:hubspot:done");
  };

  public console = {
    user: {
      upsert: async (consoleUser: ConsoleUserInfoType) => {
        return this.upsert(consoleUser);
      },
    },
  };

  public web = {
    user: {
      upsert: async (webUser: WebUserInfoType) => {
        return this.upsert(webUser);
      },
      delete: async (webUser: WebUserInfoType) => {
        const contactId = await this.service.getHubSpotContactId(webUser.email);
        if (contactId) {
          return this.service.deleteContact(contactId);
        } else {
          throw Error("Web user not found in service");
        }
      },
    },
  };
}
