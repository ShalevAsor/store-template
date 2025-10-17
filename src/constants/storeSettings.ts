// import { SettingType, SettingCategory } from "@prisma/client";

// export const STORE_SETTING_KEYS = {
//   STORE_NAME: "store.identity.name",
//   STORE_DESCRIPTION: "store.identity.description",
//   CONTACT_EMAIL: "store.identity.contact.email",
//   CURRENCY: "store.operational.currency",
//   TAX_RATE: "store.operational.tax_rate",
//   FREE_SHIPPING_THRESHOLD: "store.operational.free_shipping_threshold",
//   STANDARD_SHIPPING_COST: "store.operational.standard_shipping_cost",
// } as const;

// export const DEFAULT_SETTINGS = {
//   [STORE_SETTING_KEYS.STORE_NAME]: {
//     value: "My Store",
//     type: SettingType.STRING,
//     category: SettingCategory.STORE_IDENTITY,
//     description: "The name of your store",
//     isRequired: true,
//   },
//   [STORE_SETTING_KEYS.STORE_DESCRIPTION]: {
//     value: "Welcome to our amazing store.",
//     type: SettingType.TEXT_AREA,
//     category: SettingCategory.STORE_IDENTITY,
//     description: "Brief description of your store",
//     isRequired: false,
//   },
//   [STORE_SETTING_KEYS.CONTACT_EMAIL]: {
//     value: "contact@mystore.com",
//     type: SettingType.EMAIL,
//     category: SettingCategory.STORE_IDENTITY,
//     description: "Primary contact email",
//     isRequired: true,
//   },
//   [STORE_SETTING_KEYS.CURRENCY]: {
//     value: "USD",
//     type: SettingType.STRING,
//     category: SettingCategory.OPERATIONAL,
//     description: "Store currency",
//     isRequired: true,
//   },
//   [STORE_SETTING_KEYS.TAX_RATE]: {
//     value: "17", // 17%
//     type: SettingType.NUMBER,
//     category: SettingCategory.OPERATIONAL,
//     description: "Tax rate as percentage (e.g., 17 for 17%)",
//     isRequired: true,
//   },
//   [STORE_SETTING_KEYS.FREE_SHIPPING_THRESHOLD]: {
//     value: "",
//     type: SettingType.NUMBER,
//     category: SettingCategory.OPERATIONAL,
//     description:
//       "Minimum order amount for free shipping (leave empty for no free shipping)",
//     isRequired: false,
//   },
//   [STORE_SETTING_KEYS.STANDARD_SHIPPING_COST]: {
//     value: "2500", // $25.00 in cents
//     type: SettingType.NUMBER,
//     category: SettingCategory.OPERATIONAL,
//     description: "Standard shipping cost",
//     isRequired: true,
//   },
// };

// /**
//  * Metadata for each category (for UI display)
//  * This CANNOT use Prisma types - it adds display info not in database
//  */
// export const CATEGORY_METADATA = {
//   [SettingCategory.STORE_IDENTITY]: {
//     label: "Store Identity",
//     description: "Basic information about your store",
//   },
//   [SettingCategory.OPERATIONAL]: {
//     label: "Operational",
//     description: "Currency, taxes, and operational settings",
//   },
//   [SettingCategory.CONTENT]: {
//     label: "Content",
//     description: "Policies, terms, and footer content",
//   },
//   [SettingCategory.BUSINESS]: {
//     label: "Business",
//     description: "Business hours and operational details",
//   },
//   [SettingCategory.EMAIL_TEMPLATES]: {
//     label: "Email Templates",
//     description: "Customize email notifications",
//   },
//   [SettingCategory.APPEARANCE]: {
//     label: "Appearance",
//     description: "Colors and branding",
//   },
// } as const;

// // Type exports - now properly tied to Prisma
// type DefaultSettingKey = keyof typeof DEFAULT_SETTINGS;

// export const isValidSettingKey = (k: string): k is DefaultSettingKey => {
//   return k in DEFAULT_SETTINGS;
// };
// export const getDescription = (key: string) => {
//   if (!isValidSettingKey(key)) return "";
//   return DEFAULT_SETTINGS[key].description;
// };

// export const CATEGORY_LIST = Object.entries(CATEGORY_METADATA).map(
//   ([id, metadata]) => ({
//     id: id as SettingCategory,
//     label: metadata.label,
//     description: metadata.description,
//   })
// );
import { SettingType, SettingCategory } from "@prisma/client";

export const STORE_SETTING_KEYS = {
  STORE_NAME: "store.identity.name",
  STORE_DESCRIPTION: "store.identity.description",
  CONTACT_EMAIL: "store.identity.contact.email",
  CURRENCY: "store.operational.currency",
  TAX_RATE: "store.operational.tax_rate",
  FREE_SHIPPING_THRESHOLD: "store.operational.free_shipping_threshold",
  STANDARD_SHIPPING_COST: "store.operational.standard_shipping_cost",
} as const;
export type SettingKey =
  (typeof STORE_SETTING_KEYS)[keyof typeof STORE_SETTING_KEYS];

interface SettingDefinition {
  value: string;
  type: SettingType;
  category: SettingCategory;
  description: string;
  isRequired: boolean;
}

export const DEFAULT_SETTINGS: Record<SettingKey, SettingDefinition> = {
  [STORE_SETTING_KEYS.STORE_NAME]: {
    value: "My Store",
    type: SettingType.STRING,
    category: SettingCategory.STORE_IDENTITY,
    description: "The name of your store",
    isRequired: true,
  },
  [STORE_SETTING_KEYS.STORE_DESCRIPTION]: {
    value: "Welcome to our amazing store.",
    type: SettingType.TEXT_AREA,
    category: SettingCategory.STORE_IDENTITY,
    description: "Brief description of your store",
    isRequired: false,
  },
  [STORE_SETTING_KEYS.CONTACT_EMAIL]: {
    value: "contact@mystore.com",
    type: SettingType.EMAIL,
    category: SettingCategory.STORE_IDENTITY,
    description: "Primary contact email",
    isRequired: true,
  },
  [STORE_SETTING_KEYS.CURRENCY]: {
    value: "USD",
    type: SettingType.STRING,
    category: SettingCategory.OPERATIONAL,
    description: "Store currency",
    isRequired: true,
  },
  [STORE_SETTING_KEYS.TAX_RATE]: {
    value: "17", // 17%
    type: SettingType.NUMBER,
    category: SettingCategory.OPERATIONAL,
    description: "Tax rate as percentage (e.g., 17 for 17%)",
    isRequired: true,
  },
  [STORE_SETTING_KEYS.FREE_SHIPPING_THRESHOLD]: {
    value: "",
    type: SettingType.NUMBER,
    category: SettingCategory.OPERATIONAL,
    description:
      "Minimum order amount for free shipping (leave empty for no free shipping)",
    isRequired: false,
  },
  [STORE_SETTING_KEYS.STANDARD_SHIPPING_COST]: {
    value: "2500", // $25.00 in cents
    type: SettingType.NUMBER,
    category: SettingCategory.OPERATIONAL,
    description: "Standard shipping cost",
    isRequired: true,
  },
};

/**
 * Metadata for each category (for UI display)
 * This CANNOT use Prisma types - it adds display info not in database
 */
export const CATEGORY_METADATA = {
  [SettingCategory.STORE_IDENTITY]: {
    label: "Store Identity",
    description: "Basic information about your store",
  },
  [SettingCategory.OPERATIONAL]: {
    label: "Operational",
    description: "Currency, taxes, and operational settings",
  },
  [SettingCategory.CONTENT]: {
    label: "Content",
    description: "Policies, terms, and footer content",
  },
  [SettingCategory.BUSINESS]: {
    label: "Business",
    description: "Business hours and operational details",
  },
  [SettingCategory.EMAIL_TEMPLATES]: {
    label: "Email Templates",
    description: "Customize email notifications",
  },
  [SettingCategory.APPEARANCE]: {
    label: "Appearance",
    description: "Colors and branding",
  },
} as const;

export const isValidSettingKey = (k: string): k is SettingKey => {
  return k in DEFAULT_SETTINGS;
};
export const getDescription = (key: string) => {
  if (!isValidSettingKey(key)) return "";
  return DEFAULT_SETTINGS[key].description;
};

export const CATEGORY_LIST = Object.entries(CATEGORY_METADATA).map(
  ([id, metadata]) => ({
    id: id as SettingCategory,
    label: metadata.label,
    description: metadata.description,
  })
);
