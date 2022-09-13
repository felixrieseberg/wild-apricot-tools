import fetch from "node-fetch";
import { Member } from "./interfaces";

const OAUTH_TOKEN_URL = "https://oauth.wildapricot.org/auth/token";
const API_BASE_URL = "https://api.wildapricot.org/v2/";

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

export async function getWaMembers(): Promise<Array<Member>> {
  const { Id } = _cachedAccount;
  const { access_token } = _cachedAuth;
  const async = `?$async=false`;
  const select = `&$select=email`;
  const filter = `&'Membership status.Id' eq 1`;
  const url = `${API_BASE_URL}/accounts/${Id}/contacts${async}${select}${filter}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  const parsedResponse = (await response.json()) as WildApricotContacts;
  const contacts = parsedResponse.Contacts;

  // Cut this down
  const members: Array<Member> = contacts.map((contact) => ({
    firstName: contact.FirstName,
    lastName: contact.LastName,
    email: contact.Email,
  }));

  return members;
}
