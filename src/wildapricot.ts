import fetch, { Response } from "node-fetch";
import { VERBOSE } from "./config.js";
import { Member, WildApricot } from "./interfaces";

const OAUTH_TOKEN_URL = "https://oauth.wildapricot.org/auth/token";
const API_BASE_URL = "https://api.wildapricot.org/v2";

let _cachedAuth: WildApricotAuthResponse;
let _cachedAccount: WildApricotAccount;

export interface WildApricotAuthResponse {
  access_token: String;
  token_type: String;
  expires_in: Number;
  refresh_token: "not_requested";
  Permissions: [
    {
      AccountId: Number;
      SecurityProfileId: Number;
      AvailableScopes: Array<String>;
    }
  ];
}

export interface WildApricotOptions {
  apiKey: string;
}

export async function getWaAuth({
  apiKey,
}: WildApricotOptions): Promise<WildApricotAuthResponse> {
  // If cached, return cached
  if (_cachedAuth) {
    return _cachedAuth;
  }

  // Not cached, let's go
  const body = new URLSearchParams();

  body.append("grant_type", "client_credentials");
  body.append("scope", "auto");

  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    body,
    headers: {
      Accept: "application/json",
      Authorization:
        "Basic " + Buffer.from(`APIKEY:${apiKey}`).toString("base64"),
    },
  });

  _cachedAuth = (await response.json()) as WildApricotAuthResponse;

  return _cachedAuth;
}

export interface WildApricotAccount {
  Id: number;
}

export type WildApricotAccounts = Array<WildApricotAccount>;

export async function getWaAccount(): Promise<WildApricotAccount> {
  const { access_token } = _cachedAuth;
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const accounts = (await response.json()) as WildApricotAccounts;

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error(`Could not get Wild Apricot accounts`);
  }

  return (_cachedAccount = accounts[0]);
}

export interface WildApricotContact {
  Id: 0;
  Url: String;
  FirstName: String;
  LastName: String;
  Organization: String;
  Email: String;
  DisplayName: String;
  ProfileLastUpdated: String;
  MembershipLevel: {
    Id: 0;
    Url: String;
    Name: String;
  };
  MembershipEnabled: boolean;
  Status:
    | "Active"
    | "Lapsed"
    | "PendingNew"
    | "PendingRenewal"
    | "PendingUpgrade";
  IsAccountAdministrator: boolean;
  TermsOfUseAccepted: boolean;
  FieldValues: Array<Record<string, string>>;
}

export interface WildApricotContacts {
  ResultId: String;
  ResultUrl: String;
  Requested: String;
  Processed: String;
  InitialQuery: {
    ObjectType: String;
    FilterExpression: String;
    SelectExpression: String;
    ReturnIds: true;
  };
  ErrorDetails: String;
  ContactIdentifiers: [0];
  Count: 0;
  Contacts: Array<WildApricotContact>;
}

export async function getWaFields() {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const url = `${API_BASE_URL}/accounts/${Id}/contactfields`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const parsedResponse = await response.json();

  if (VERBOSE) {
    console.log(parsedResponse);
  }
}

export async function getWaMembers(): Promise<Array<Member>> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const async = `?$async=false`;
  const select = `&$select=email`;
  const filter = `&$filter='Membership status.Id' eq 1 AND Archived eq 'False'`;
  const url = `${API_BASE_URL}/accounts/${Id}/contacts${async}${select}${filter}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const parsedResponse = (await response.json()) as WildApricotContacts;
  const contacts = parsedResponse.Contacts;

  if (VERBOSE) {
    console.log(`Wild Apricot response:`);
    const cloned = {
      ...parsedResponse,
      Contacts: `[ ${contacts.length} contacts ]`,
    };
  }

  // Cut this down
  const members: Array<Member> = contacts.map((contact) => ({
    firstName: contact.FirstName,
    lastName: contact.LastName,
    email: contact.Email,
  }));

  return members;
}

export interface WildApricotEvent {}

export interface GetWaEventsOptions {
  eventName: string;
  startDate: string; // 2015-06-15
}

export interface WildApricotEvents {
  Count: 0;
  Events: Array<WildApricot.Event>;
}

export async function getWaEvents(
  options: GetWaEventsOptions
): Promise<Array<WildApricot.Event>> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const { startDate, eventName } = options;
  const async = `?$async=false`;
  const filter = `&$filter=Name eq '${eventName}' AND StartDate ge ${startDate}`;
  const url = `${API_BASE_URL}/accounts/${Id}/events${async}${filter}`;

  if (VERBOSE) {
    console.log(`Calling GET ${url}`);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  await checkResponse(response);

  const parsedResponse = (await response.json()) as WildApricotEvents;
  const events = parsedResponse.Events;

  if (VERBOSE) {
    console.log(`Wild Apricot response:`);
    const cloned = {
      ...parsedResponse,
      Events: `[ ${events.length} events ]`,
    };
    console.log(cloned);
  }

  return events;
}

export async function getWaEvent(id: number): Promise<WildApricot.Event> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const url = `${API_BASE_URL}/accounts/${Id}/events/${id}`;

  if (VERBOSE) {
    console.log(`Calling GET ${url}`);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  await checkResponse(response);

  const parsedResponse = (await response.json()) as WildApricot.Event;

  if (VERBOSE) {
    console.log(`Wild Apricot response:`);
    console.log(parsedResponse);
  }

  return parsedResponse;
}

export async function updateWaEvent(
  edit: WildApricot.EventEdit
): Promise<WildApricot.Event> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const url = `${API_BASE_URL}/accounts/${Id}/events/${edit.Id}`;
  const body = JSON.stringify(edit);

  if (VERBOSE) {
    console.log(`Calling PUT ${url}`);
    console.log({ body });
  }

  const response = await fetch(url, {
    method: "PUT",
    body,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  await checkResponse(response);

  const parsedResponse = (await response.json()) as WildApricot.Event;

  if (VERBOSE) {
    console.log(`Wild Apricot response:`);
    console.log(parsedResponse);
  }

  return parsedResponse;
}

export async function cloneWaEvent(id: number): Promise<number> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const url = `${API_BASE_URL}/rpc/${Id}/cloneevent`;
  const body = JSON.stringify({ EventId: id });

  if (VERBOSE) {
    console.log(`Calling POST ${url}`);
    console.log({ body });
  }

  const response = await fetch(url, {
    method: "POST",
    body,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  await checkResponse(response);

  const parsedResponse = await response.text();

  if (VERBOSE) {
    console.log(`Wild Apricot response:`);
    console.log(parsedResponse);
  }

  return parseInt(parsedResponse, 10);
}

export async function getWaEventRegistrations(
  id: string | number
): Promise<Array<WildApricot.EventRegistration>> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const url = `${API_BASE_URL}/accounts/${Id}/eventregistrations?eventId=${id}&includeWaitlist=true&includeDetails=true`;

  if (VERBOSE) {
    console.log(`Calling GET ${url}`);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  await checkResponse(response);

  const parsedResponse =
    (await response.json()) as Array<WildApricot.EventRegistration>;

  if (VERBOSE) {
    console.log(`Wild Apricot response:`);
    console.log(parsedResponse);
  }

  return parsedResponse;
}

async function checkResponse(response: Response) {
  if (!response.ok) {
    console.log(
      `Response not ok (was: ${response.status} ${response.statusText})`
    );
    console.log(await response.text());

    throw new Error(`Response was not ok`);
  }
}
