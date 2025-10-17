// components/admin/settings/SettingsFormContainer.tsx
import { SettingCategory } from "@prisma/client";
import { StoreIdentityForm } from "./StoreIdentityForm";
import { StoreOperationalForm } from "./StoreOperationalForm";
import { STORE_SETTING_KEYS, getDescription } from "@/constants/storeSettings";
import { minorToMajorUnit } from "@/utils/currencyUtils";

interface SettingsFormContainerProps {
  category: SettingCategory;
  settings: Record<string, string>;
}

export function SettingsFormContainer({
  category,
  settings,
}: SettingsFormContainerProps) {
  const currency = settings[STORE_SETTING_KEYS.CURRENCY];
  switch (category) {
    case SettingCategory.STORE_IDENTITY:
      return (
        <StoreIdentityForm
          initialData={{
            storeName: settings[STORE_SETTING_KEYS.STORE_NAME],
            storeDescription: settings[STORE_SETTING_KEYS.STORE_DESCRIPTION],
            contactEmail: settings[STORE_SETTING_KEYS.CONTACT_EMAIL],
          }}
          descriptions={{
            storeName: getDescription(STORE_SETTING_KEYS.STORE_NAME),
            storeDescription: getDescription(
              STORE_SETTING_KEYS.STORE_DESCRIPTION
            ),
            contactEmail: getDescription(STORE_SETTING_KEYS.CONTACT_EMAIL),
          }}
        />
      );

    case SettingCategory.OPERATIONAL:
      return (
        <StoreOperationalForm
          initialData={{
            currency: settings[STORE_SETTING_KEYS.CURRENCY],
            taxRate: settings[STORE_SETTING_KEYS.TAX_RATE],
            freeShippingThreshold: settings[
              STORE_SETTING_KEYS.FREE_SHIPPING_THRESHOLD
            ]
              ? minorToMajorUnit(
                  parseInt(
                    settings[STORE_SETTING_KEYS.FREE_SHIPPING_THRESHOLD]
                  ),
                  currency
                ).toString()
              : "",
            standardShippingCost: minorToMajorUnit(
              parseInt(settings[STORE_SETTING_KEYS.STANDARD_SHIPPING_COST]),
              currency
            ).toString(),
          }}
          descriptions={{
            currency: getDescription(STORE_SETTING_KEYS.CURRENCY),
            taxRate: getDescription(STORE_SETTING_KEYS.TAX_RATE),
            freeShippingThreshold: getDescription(
              STORE_SETTING_KEYS.FREE_SHIPPING_THRESHOLD
            ),
            standardShippingCost: getDescription(
              STORE_SETTING_KEYS.STANDARD_SHIPPING_COST
            ),
          }}
        />
      );

    default:
      return (
        <p className="text-muted-foreground">No settings configured yet.</p>
      );
  }
}
