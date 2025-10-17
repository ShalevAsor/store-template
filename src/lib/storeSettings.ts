import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import {
  DEFAULT_SETTINGS,
  isValidSettingKey,
  SettingKey,
} from "@/constants/storeSettings";
import { SettingCategory } from "@prisma/client"; // ✅ Add this import

/**
 * Get a single setting value with caching
 * Returns the database value or falls back to default
 */
export async function getSetting(key: SettingKey): Promise<string> {
  if (!isValidSettingKey(key)) {
    console.error(`Invalid setting key: ${key}`);
    return "";
  }

  const getCachedSetting = unstable_cache(
    async () => {
      try {
        const setting = await prisma.storeSetting.findUnique({
          where: { key },
        });
        return setting?.value || DEFAULT_SETTINGS[key].value;
      } catch (error) {
        console.error(`Failed to get setting ${key}:`, error);
        return DEFAULT_SETTINGS[key].value;
      }
    },
    [`setting-${key}`],
    {
      tags: ["settings"],
      revalidate: 3600, // Cache for 1 hour
    }
  );

  return getCachedSetting();
}

/**
 * Get multiple settings at once with caching
 */
export async function getSettings(
  keys: SettingKey[]
): Promise<Record<string, string>> {
  const validKeys = keys.filter((key) => {
    const isValid = isValidSettingKey(key);
    if (!isValid) {
      console.error(`Invalid setting key: ${key}`);
    }
    return isValid;
  });

  const getCachedSettings = unstable_cache(
    async () => {
      try {
        const settings = await prisma.storeSetting.findMany({
          where: { key: { in: validKeys } },
        });

        const result: Record<string, string> = {};
        validKeys.forEach((key) => {
          const setting = settings.find((s) => s.key === key);
          result[key] = setting?.value || DEFAULT_SETTINGS[key].value;
        });

        return result;
      } catch (error) {
        console.error("Failed to get settings:", error);
        const result: Record<string, string> = {};
        validKeys.forEach((key) => {
          result[key] = DEFAULT_SETTINGS[key].value;
        });
        return result;
      }
    },
    [`settings-${validKeys.sort().join("-")}`],
    {
      tags: ["settings"],
      revalidate: 3600,
    }
  );

  return getCachedSettings();
}

/**
 * Get all settings for a specific category
 * Useful when you have many settings in a category
 */
export async function getSettingsByCategory(
  category: SettingCategory
): Promise<Record<string, string>> {
  const keysForCategory = Object.entries(DEFAULT_SETTINGS)
    .filter(([_, definition]) => definition.category === category)
    .map(([key]) => key as SettingKey);

  return getSettings(keysForCategory);
}

/**
 * Update a single setting in database
 * Internal helper - used by server actions
 */
export async function updateSetting(
  key: SettingKey,
  value: string
): Promise<void> {
  if (!isValidSettingKey(key)) {
    throw new Error(`Invalid setting key: ${key}`);
  }

  const definition = DEFAULT_SETTINGS[key];

  if (definition.isRequired && value.trim() === "") {
    throw new Error(`${key} is required and no value provided`);
  }

  await prisma.storeSetting.upsert({
    where: { key },
    update: {
      value,
    },
    create: {
      key,
      value,
      type: definition.type,
      category: definition.category,
      description: definition.description,
      isRequired: definition.isRequired,
    },
  });
}
