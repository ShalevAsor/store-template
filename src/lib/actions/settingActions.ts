"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ActionResult } from "@/types/common";
import { updateSetting } from "@/lib/storeSettings";
import { prisma } from "../prisma";
import {
  DEFAULT_SETTINGS,
  STORE_SETTING_KEYS,
} from "@/constants/storeSettings";
import {
  storeIdentitySchema,
  StoreIdentityFormData,
  storeOperationalSchema,
  StoreOperationalFormData,
} from "@/schemas/settingsSchema";
import { createErrorResult } from "@/utils/errorUtils";
import { majorUnitToMinor } from "@/utils/currencyUtils";

export async function updateStoreIdentityAction(
  data: StoreIdentityFormData
): Promise<ActionResult<{ message: string }>> {
  try {
    // Server-side validation
    const validated = storeIdentitySchema.parse(data);

    // Update settings
    await Promise.all([
      updateSetting(STORE_SETTING_KEYS.STORE_NAME, validated.storeName),
      updateSetting(
        STORE_SETTING_KEYS.STORE_DESCRIPTION,
        validated.storeDescription || ""
      ),
      updateSetting(STORE_SETTING_KEYS.CONTACT_EMAIL, validated.contactEmail),
    ]);

    // Invalidate caches
    revalidateTag("settings");
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return {
      success: true,
      data: { message: "Store identity updated successfully" },
    };
  } catch (error) {
    console.error("Failed to update store identity:", error);
    return createErrorResult({ error });
  }
}

export async function updateSettingOperationalAction(
  data: StoreOperationalFormData
): Promise<ActionResult<{ message: string }>> {
  try {
    // Server-side validation
    const validated = storeOperationalSchema.parse(data);

    // Convert major units to minor units for storage
    const freeShippingThreshold = validated.freeShippingThreshold
      ? majorUnitToMinor(
          parseFloat(validated.freeShippingThreshold),
          validated.currency
        ).toString()
      : "";

    const standardShippingCost = majorUnitToMinor(
      parseFloat(validated.standardShippingCost),
      validated.currency
    ).toString();
    // Update settings
    await Promise.all([
      updateSetting(STORE_SETTING_KEYS.CURRENCY, validated.currency),
      updateSetting(STORE_SETTING_KEYS.TAX_RATE, validated.taxRate),
      updateSetting(
        STORE_SETTING_KEYS.FREE_SHIPPING_THRESHOLD,
        freeShippingThreshold
      ),
      updateSetting(
        STORE_SETTING_KEYS.STANDARD_SHIPPING_COST,
        standardShippingCost
      ),
    ]);

    // Invalidate caches
    revalidateTag("settings");
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return {
      success: true,
      data: { message: "Operational settings updated successfully" },
    };
  } catch (error) {
    console.error("Failed to update store identity:", error);
    return createErrorResult({ error });
  }
}

/**
 * Seed default settings
 */
export async function seedDefaultSettingsAction(): Promise<ActionResult> {
  try {
    const promises = Object.entries(DEFAULT_SETTINGS).map(([key, definition]) =>
      prisma.storeSetting.upsert({
        where: { key },
        update: {}, // Don't overwrite existing settings
        create: {
          key,
          value: definition.value,
          type: definition.type,
          category: definition.category,
          description: definition.description,
          isRequired: definition.isRequired,
        },
      })
    );

    await Promise.all(promises);

    // Invalidate cache after seeding
    revalidateTag("settings");
    revalidatePath("/admin/settings");

    return {
      success: true,
      data: { message: "Default settings seeded successfully" },
    };
  } catch (error) {
    console.error("Failed to seed default settings:", error);
    return {
      success: false,
      error: "Failed to seed settings",
    };
  }
}
