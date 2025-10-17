import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  STORE_SETTING_KEYS,
  DEFAULT_SETTINGS,
  CATEGORY_LIST,
} from "@/constants/storeSettings";
import {
  getSetting,
  getSettings,
  getSettingsByCategory,
} from "@/lib/storeSettings";

export default async function TestSettingsPage() {
  // 1. Get single setting
  const storeName = await getSetting(STORE_SETTING_KEYS.STORE_NAME);

  // 2. Get multiple specific settings
  const specificSettings = await getSettings([
    STORE_SETTING_KEYS.STORE_NAME,
    STORE_SETTING_KEYS.CONTACT_EMAIL,
  ]);

  // 3. Get all settings from a category
  const identitySettings = await getSettingsByCategory("STORE_IDENTITY");
  const operationalSettings = await getSettingsByCategory("OPERATIONAL");

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings System Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Testing all methods to fetch and display settings
        </p>
      </div>

      <Separator />

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle>1. Default Settings (Constants)</CardTitle>
          <CardDescription>
            These are the default values defined in constants/storeSettings.ts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">All Default Settings:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(DEFAULT_SETTINGS, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Method 1: Single Setting */}
      <Card>
        <CardHeader>
          <CardTitle>2. Get Single Setting</CardTitle>
          <CardDescription>
            Using:{" "}
            <code className="text-xs bg-muted px-2 py-1 rounded">
              await getSetting(STORE_SETTING_KEYS.STORE_NAME)
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Store Name:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono">{storeName}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Usage:</p>
            <pre className="text-xs overflow-auto">
              {`const storeName = await getSetting(
  STORE_SETTING_KEYS.STORE_NAME
);`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Method 2: Multiple Specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle>3. Get Multiple Specific Settings</CardTitle>
          <CardDescription>
            Using:{" "}
            <code className="text-xs bg-muted px-2 py-1 rounded">
              await getSettings([...keys])
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Selected Settings:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(specificSettings, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Usage:</p>
            <pre className="text-xs overflow-auto">
              {`const settings = await getSettings([
  STORE_SETTING_KEYS.STORE_NAME,
  STORE_SETTING_KEYS.CONTACT_EMAIL,
]);

// Access values:
settings[STORE_SETTING_KEYS.STORE_NAME]
settings[STORE_SETTING_KEYS.CONTACT_EMAIL]`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Method 3: Settings by Category */}
      <Card>
        <CardHeader>
          <CardTitle>4. Get Settings by Category (Helper)</CardTitle>
          <CardDescription>
            Using:{" "}
            <code className="text-xs bg-muted px-2 py-1 rounded">
              await getSettingsByCategory("STORE_IDENTITY")
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                Store Identity Settings:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(identitySettings, null, 2)}
              </pre>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Operational Settings:</p>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(operationalSettings, null, 2)}
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Usage:</p>
            <pre className="text-xs overflow-auto">
              {`const identitySettings = await getSettingsByCategory(
  "STORE_IDENTITY"
);

// Access values:
identitySettings[STORE_SETTING_KEYS.STORE_NAME]
identitySettings[STORE_SETTING_KEYS.CONTACT_EMAIL]`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Available Categories */}
      <Card>
        <CardHeader>
          <CardTitle>5. Available Categories</CardTitle>
          <CardDescription>
            All categories defined in CATEGORY_METADATA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {CATEGORY_LIST.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 space-y-1"
              >
                <p className="font-medium">{category.label}</p>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {category.id}
                </code>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Usage:</p>
            <pre className="text-xs overflow-auto">
              {`import { CATEGORY_LIST } from "@/constants/storeSettings";

// Use in components:
{CATEGORY_LIST.map((category) => (
  <div key={category.id}>
    {category.label}
  </div>
))}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* All Setting Keys */}
      <Card>
        <CardHeader>
          <CardTitle>6. All Available Setting Keys</CardTitle>
          <CardDescription>Constants from STORE_SETTING_KEYS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(STORE_SETTING_KEYS).map(([key, value]) => (
              <div key={key} className="border rounded p-3 space-y-1">
                <p className="text-sm font-medium font-mono">{key}</p>
                <p className="text-xs text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Usage:</p>
            <pre className="text-xs overflow-auto">
              {`import { STORE_SETTING_KEYS } from "@/constants/storeSettings";

// Always use constants instead of strings:
✅ getSetting(STORE_SETTING_KEYS.STORE_NAME)
❌ getSetting("store.identity.name")`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Caching Info */}
      <Card>
        <CardHeader>
          <CardTitle>7. Caching Behavior</CardTitle>
          <CardDescription>How the settings are cached</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <div>
                <p className="font-medium">Cached for 1 hour</p>
                <p className="text-sm text-muted-foreground">
                  Settings are cached using Next.js unstable_cache
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <div>
                <p className="font-medium">Automatic invalidation</p>
                <p className="text-sm text-muted-foreground">
                  Cache clears when settings are updated via server actions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <div>
                <p className="font-medium">Tagged for invalidation</p>
                <p className="text-sm text-muted-foreground">
                  All settings use the "settings" tag
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Implementation:</p>
            <pre className="text-xs overflow-auto">
              {`// In lib/storeSettings.ts:
unstable_cache(
  async () => { /* fetch logic */ },
  [\`setting-\${key}\`],
  {
    tags: ["settings"],
    revalidate: 3600, // 1 hour
  }
);

// In server actions:
revalidateTag("settings"); // Clears cache`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>
            Common patterns you'll use in your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="font-medium mb-2">In Server Components:</p>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
              {`// Single setting
const name = await getSetting(STORE_SETTING_KEYS.STORE_NAME);

// Multiple settings
const settings = await getSettings([
  STORE_SETTING_KEYS.STORE_NAME,
  STORE_SETTING_KEYS.CONTACT_EMAIL,
]);

// All settings from a category
const settings = await getSettingsByCategory("STORE_IDENTITY");`}
            </pre>
          </div>

          <div>
            <p className="font-medium mb-2">In Server Actions:</p>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
              {`"use server";

export async function updateSettingsAction(data) {
  await updateSetting(STORE_SETTING_KEYS.STORE_NAME, data.name);
  
  // Clear cache
  revalidateTag("settings");
  revalidatePath("/admin/settings");
}`}
            </pre>
          </div>

          <div>
            <p className="font-medium mb-2">Test the cache:</p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Visit this page - settings load from database</li>
              <li>Refresh - settings load from cache (instant)</li>
              <li>Update a setting in admin</li>
              <li>Refresh this page - new values show (cache cleared)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
