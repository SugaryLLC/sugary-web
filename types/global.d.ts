// types/global.d.ts
declare global {
  export interface User {
    MinimumVersion: string;
    MaintenanceUntil: string; // ISO string
    Username: string;
    Avatar: string | null;
    CoverThemeIndex: number | null;
    PhoneNumber: string | null;
    Birthday: string | null; // ISO string
    Email: string | null;
    FullName: string;
    FirstName: string;
    LastName: string;
    PronounId: number | null;
    IsCustomer: boolean;
    IsGuest: boolean;
    SuperAdmin: boolean;
    Id: string;
    RoleId: number | null;
    PreferredChat: "whatsapp" | "messenger" | "telegram" | string | null;
    PhoneNumberConfirmed: boolean;
    EmailConfirmed: boolean;
    IsBlocked: boolean;
    OnBoardCompleted: boolean;
    OccasionDatesJson: string | null;
    ProfileCompletePercent: number;
    CountryIso2: string;
    GiftingPlace: GiftingPlace | null;
    Currency: Currency | null;
    Role: string | null;
    OccasionDates: string[]; // ISO strings
    OccasionCount: number;
  }
}

export {};
