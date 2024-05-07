import { ISyncServices } from "../ISyncService";
import HubSpotService from "./HubSpotService";
import SendgridService from "./SendgridService";

const services: ISyncServices[] = [
  //CloseComService, This service gets a special treatment after deciding it shouldn't get the same treatment as Sendgrid
  SendgridService,
  HubSpotService,
];

export default services;
