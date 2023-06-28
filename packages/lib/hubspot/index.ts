import { Client } from "@hubspot/api-client";
import { Specialization } from "@prisma/client";

interface UserData {
  email: string;
  contactGroup: "client" | "coach";
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  companyName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  zip?: string | null;
  city?: string | null;
  appointmentTypes?: string | null;
  specializations?: Specialization[] | null;
}

interface HubspotGetUserResponse {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived: string;
}

const keys = [
  "email",
  "username",
  "firstName",
  "lastName",
  "bio",
  "companyName",
  "addressLine1",
  "addressLine2",
  "zip",
  "city",
  "appointmentTypes",
  "specializations",
  "contactGroup",
] as const;

type Key = typeof keys[number];

const labels: Record<Key, string> = {
  email: "email",
  username: "benutzername",
  firstName: "vorname",
  lastName: "nachname",
  bio: "beschreibung",
  companyName: "unternehmensname",
  addressLine1: "adresszeile1",
  addressLine2: "adresszeile2",
  zip: "postleitzahl",
  city: "stadt",
  appointmentTypes: "terminarten",
  specializations: "fachgebiete",
  contactGroup: "kontaktgruppe",
};

class Hubspot {
  private BASE_URL = "https://api.hubapi.com/crm/v3/objects/contacts";
  private client: Client;

  constructor() {
    this.client = new Client({ accessToken: process.env.HUBSPOT_API_KEY });
  }

  private constructProperties(user: UserData) {
    const properties: Record<string, string> = {};

    for (const key of keys) {
      const hsLabel = labels[key];

      if (!hsLabel || !user[key]) {
        continue;
      }

      // Special case
      if (key === "specializations") {
        // Values for multi checkbox in Hubspot sent with `;` separated values
        properties[hsLabel] = user.specializations?.map((s) => s.label).join(";") ?? "";
        continue;
      }

      properties[hsLabel] = user[key] ?? "";
    }

    return properties;
  }

  private async getUserByEmail(email: string): Promise<HubspotGetUserResponse | null> {
    try {
      const res = await fetch(`${this.BASE_URL}/${email}?idProperty=email&email=${email}`, {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = (await res.json()) as HubspotGetUserResponse;

      if (!data) {
        return null;
      }

      return data;
    } catch (err) {
      console.log("[HUBSPOT]: Error while fetching", err);
      return null;
    }
  }

  async createUser(newUser: UserData) {
    try {
      await this.client.crm.contacts.basicApi.create({
        properties: this.constructProperties(newUser),
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  async updateUser(userToUpdate: UserData) {
    const user = await this.getUserByEmail(userToUpdate.email);
    if (!user) {
      return false;
    }

    try {
      await this.client.crm.contacts.basicApi.update(user.id, {
        properties: this.constructProperties(userToUpdate),
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  async updateOrCreateUsers(users: UserData[]): Promise<boolean> {
    console.log("[HUBBY] called");
    // Base condition
    if (users.length === 0) {
      return true;
    }

    console.log("[HUBBY] running");

    // Hubspot API limit
    const currentUsers = users.slice(0, 100);

    const hubspotUserIdsWithData: Record<string, string> = {};

    try {
      console.log("[HUBBY] reading hs users");
      const hsUsers = await this.client.crm.contacts.batchApi.read({
        idProperty: "email",
        inputs: currentUsers.map((user) => ({ id: user.email })),
        properties: [],
        propertiesWithHistory: [],
      });

      console.log("[HUBBY] reading hs users completed", hsUsers);

      if (!hsUsers) {
        return false;
      }

      console.log("[HUBBY] going throguh list");
      for (const hsUser of hsUsers.results) {
        if (!hsUser.properties.email) {
          continue;
        }

        hubspotUserIdsWithData[hsUser.properties.email] = hsUser.id;
      }
      console.log("[HUBBY] list constructed", hubspotUserIdsWithData);

      const usersToUpdate: (UserData & { internalId: string })[] = [];
      const usersToCreate: UserData[] = [];

      currentUsers.forEach((user) => {
        if (user.email in hubspotUserIdsWithData) {
          usersToUpdate.push({ ...user, internalId: hubspotUserIdsWithData[user.email] });
        } else {
          // Create hubspot user
          usersToCreate.push(user);
        }
      });

      console.log("[HUBBY]: users to update", usersToUpdate);
      console.log("[HUBBY]: users to create", usersToCreate);

      await this.client.crm.contacts.batchApi.update({
        inputs: usersToUpdate.map((user) => {
          const { internalId, ...properties } = user;
          return {
            id: internalId,
            properties: {
              [labels.email]: properties.email,
              [labels.contactGroup]: properties.contactGroup,
              [labels.username]: properties.username ?? "",
              [labels.firstName]: properties.firstName ?? "",
              [labels.lastName]: properties.lastName ?? "",
              [labels.bio]: properties.bio ?? "",
              [labels.addressLine1]: properties.addressLine1 ?? "",
              [labels.addressLine2]: properties.addressLine2 ?? "",
              [labels.appointmentTypes]: properties.appointmentTypes ?? "",
              [labels.city]: properties.city ?? "",
              [labels.zip]: properties.zip ?? "",
              [labels.companyName]: properties.companyName ?? "",
              [labels.specializations]: properties.specializations?.map((s) => s.label).join(";") ?? "",
            },
          };
        }),
      });

      await this.client.crm.contacts.batchApi.create({
        inputs: usersToCreate.map((user) => {
          return {
            properties: {
              [labels.email]: user.email,
              [labels.contactGroup]: user.contactGroup,
              [labels.username]: user.username ?? "",
              [labels.firstName]: user.firstName ?? "",
              [labels.lastName]: user.lastName ?? "",
              [labels.bio]: user.bio ?? "",
              [labels.addressLine1]: user.addressLine1 ?? "",
              [labels.addressLine2]: user.addressLine2 ?? "",
              [labels.appointmentTypes]: user.appointmentTypes ?? "",
              [labels.city]: user.city ?? "",
              [labels.zip]: user.zip ?? "",
              [labels.companyName]: user.companyName ?? "",
              [labels.specializations]: user.specializations?.map((s) => s.label).join(";") ?? "",
            },
          };
        }),
      });
      console.log("[HUBBY]: operation succeded");
    } catch (err) {
      console.log("[HUBBY]: an error occurred", err);
      return false;
    }

    // Hubspot API limit, making separate call
    return this.updateOrCreateUsers(users.slice(100));
  }

  async deleteUser(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }

    try {
      await this.client.crm.contacts.basicApi.archive(email);
      return true;
    } catch (err) {
      return false;
    }
  }
}

const client = new Hubspot();

export default client;
