import { Client } from "@hubspot/api-client";

import logger from "@calcom/lib/logger";

export type HubSpotProperties = {
  [key: string]: string;
};

const environmentApiKey = process.env.HUBSPOT_API_KEY || "";

/**
 * This class to instance communicating to HubSpot APIs requires an API Key.
 *
 * You can either pass to the constructor an API Key or have one defined as an
 * environment variable in case the communication to HubSpot is just for
 * one account only, not configurable by any user at any moment.
 */
export default class HubSpot {
  private log: typeof logger;
  private client: Client;

  constructor(providedApiKey = "") {
    this.log = logger.getChildLogger({ prefix: [`[[lib] hubspot`] });
    if (!providedApiKey && !environmentApiKey) throw Error("HubSpot Api Key not present");
    this.client = new Client({ accessToken: providedApiKey || environmentApiKey });
  }

  public async getHubSpotContactId(email: string): Promise<string | null> {
    const search = await this.client.crm.contacts.batchApi.read({
      idProperty: "email",
      inputs: [{ id: email }],
      properties: [],
      propertiesWithHistory: [],
    });
    this.log.debug("sync:hubspot:getHubSpotContactId:search", search);
    return search.results[0]?.id || null;
  }

  public async createContact(properties: HubSpotProperties): Promise<void> {
    this.log.debug("sync:hubspot:createContact");
    this.client.crm.contacts.basicApi.create({ properties });
    this.log.debug("sync:hubspot:createContact:success");
  }

  public async updateContact(contactId: string, properties: HubSpotProperties): Promise<void> {
    this.log.debug("sync:hubspot:updateContact:contactId", contactId);
    this.client.crm.contacts.basicApi.update(contactId, { properties });
    this.log.debug("sync:hubspot:updateContact:success");
  }

  public async deleteContact(contactId: string): Promise<void> {
    this.log.debug("sync:hubspot:deleteContact:contactId", contactId);
    this.client.crm.contacts.basicApi.archive(contactId);
    this.log.debug("sync:hubspot:deleteContact:success");
  }
}
