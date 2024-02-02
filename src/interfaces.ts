export interface Member {
  firstName: string;
  lastName: string;
  email: string;
  id: number;
}

export module WildApricot {
  export interface TimeZone {
    ZoneId: string;
    Name: string;
    UtcOffset: number;
  }

  export interface AvailableForMembershipLevel {
    Id: number;
    Url: string;
  }

  export interface RegistrationType {
    Id: number;
    Url: string;
    IsEnabled: boolean;
    EventId: number;
    Name: string;
    Description: string;
    BasePrice: number;
    GuestPrice: number;
    UseTaxScopeSettings: boolean;
    Availability: string;
    RegistrationCode: string;
    AvailableForMembershipLevels: AvailableForMembershipLevel[];
    AvailableFrom: string;
    AvailableThrough: string;
    MaximumRegistrantsCount: number;
    CurrentRegistrantsCount: number;
    GuestRegistrationPolicy: string;
    UnavailabilityPolicy: string;
    CancellationBehaviour: string;
    CancellationDaysBeforeEvent: number;
    IsWaitlistEnabled: boolean;
  }

  export interface AllowedValue {
    Id: number;
    Label: string;
    Position: number;
    SelectedByDefault: boolean;
    ExtraCost: number;
  }

  export interface RulesAndTermsInfo {
    Text: string;
    Link: string;
  }

  export interface ExtraCharge {
    MultiplierType: string;
    Multiplier: number;
    MinAmount: number;
    MaxAmount: number;
    MinCharge: number;
    MaxCharge: number;
  }

  export interface EventRegistrationField {
    FieldName: string;
    SystemCode: string;
    DisplayType: string;
    IsSystem: boolean;
    Description: string;
    FieldInstructions: string;
    AllowedValues: AllowedValue[];
    Order: number;
    RulesAndTermsInfo: RulesAndTermsInfo;
    FieldType: string;
    ExtraCharge: ExtraCharge;
    Kind: string;
  }

  export interface AvailableForLevel {
    Id: number;
    Url: string;
  }

  export interface AvailableForGroup {
    Id: number;
    Url: string;
  }

  export interface AccessControl {
    AccessLevel: string;
    AvailableForAnyLevel: boolean;
    AvailableForLevels: AvailableForLevel[];
    AvailableForAnyGroup: boolean;
    AvailableForGroups: AvailableForGroup[];
  }

  export interface GuestRegistrationSettings {
    Enabled: boolean;
    CreateContactMode: string;
  }

  export interface Organizer {
    Id: number;
    Url: string;
  }

  export interface WaitlistSettings {
    WaitlistType: string;
    InformationToCollect: string;
  }

  export interface AttendeesDisplaySettings {
    VisibleTo: string;
    ShowPendingAttendees: boolean;
  }

  export interface Details {
    DescriptionHtml: string;
    PaymentInstructions: string;
    TimeZone: TimeZone;
    RegistrationTypes: RegistrationType[];
    EventRegistrationFields: EventRegistrationField[];
    TotalPaid: number;
    TotalDue: number;
    AccessControl: AccessControl;
    GuestRegistrationSettings: GuestRegistrationSettings;
    Organizer: Organizer;
    PaymentMethod: string;
    RegistrationConfirmationExtraInfo: string;
    RegistrationMessage: string;
    SendEmailCopy: boolean;
    IsWaitlistEnabled: boolean;
    WaitlistSettings: WaitlistSettings;
    MultipleRegistrationAllowed: boolean;
    AttendeesDisplaySettings: AttendeesDisplaySettings;
  }

  export interface Session {
    Id: number;
    Title: string;
    StartDate: string;
    StartTimeSpecified: boolean;
    EndDate: string;
    EndTimeSpecified: boolean;
  }

  export interface InviteeStat {
    NotResponded: number;
    NotAttended: number;
    Attended: number;
    MaybeAttended: number;
  }

  export interface Event {
    Id: number;
    Url: string;
    Name: string;
    EventType: string;
    StartDate: string;
    StartTimeSpecified: boolean;
    EndDate: string;
    EndTimeSpecified: boolean;
    Location: string;
    RegistrationEnabled: boolean;
    HasEnabledRegistrationTypes: boolean;
    AccessLevel: string;
    Tags: string[];
    Details: Details;
    Sessions: Session[];
    RegistrationsLimit: number;
    InviteeStat: InviteeStat;
    PendingRegistrationsCount: number;
    ConfirmedRegistrationsCount: number;
    CheckedInAttendeesNumber: number;
  }

  export interface EditDetails {
    DescriptionHtml: string;
    PaymentInstructions: string;
    TimeZone: TimeZone;
    AccessControl: AccessControl;
    GuestRegistrationSettings: GuestRegistrationSettings;
    Organizer: Organizer;
    PaymentMethod: string;
    RegistrationConfirmationExtraInfo: string;
    RegistrationMessage: string;
    SendEmailCopy: boolean;
    IsWaitlistEnabled: boolean;
    WaitlistSettings: WaitlistSettings;
    MultipleRegistrationAllowed: boolean;
    AttendeesDisplaySettings: AttendeesDisplaySettings;
  }

  export interface EventEdit {
    Id: number;
    Name?: string;
    EventType?: string;
    StartDate?: string;
    StartTimeSpecified?: boolean;
    EndDate?: string;
    EndTimeSpecified?: boolean;
    Location?: string;
    RegistrationEnabled?: boolean;
    Tags?: string[];
    Details?: Partial<EditDetails>;
    Sessions?: Session[];
    RegistrationsLimit?: number;
  }

  export interface Contact {
    Id: number;
    Url: string;
    Name: string;
  }

  export interface RegistrationType {
    Id: number;
    Url: string;
    Name: string;
  }

  export interface GuestRegistration {
    Id: number;
    Url: string;
  }

  export interface GuestRegistrationsSummary {
    NumberOfGuests: number;
    NumberOfGuestsCheckedIn: number;
    GuestRegistrations: GuestRegistration[];
  }

  export interface RegistrationField {
    FieldName: string;
    SystemCode: string;
    Value: any;
  }

  export interface ParentRegistration {
    Id: number;
    Url: string;
  }

  export interface EventRegistration {
    Id: number;
    Url: string;
    Event: Event;
    Contact: Contact;
    RegistrationType: RegistrationType;
    RegistrationTypeId: number;
    GuestRegistrationsSummary: GuestRegistrationsSummary;
    DisplayName: string;
    Organization: string;
    IsCheckedIn: boolean;
    RegistrationFee: number;
    PaidSum: number;
    IsPaid: boolean;
    RegistrationFields: RegistrationField[];
    ShowToPublic: boolean;
    RegistrationDate: string;
    Memo: string;
    IsGuestRegistration: boolean;
    OnWaitlist: boolean;
    RecreateInvoice: boolean;
    ParentRegistration: ParentRegistration;
    Status: string;
  }
}
