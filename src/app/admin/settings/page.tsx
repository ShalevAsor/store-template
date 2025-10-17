import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORY_LIST } from "@/constants/storeSettings";
import { getSettingsByCategory } from "@/lib/storeSettings";
import { SettingCategory } from "@prisma/client";
import { SettingsFormContainer } from "@/components/admin/settings/SettingsFormContainer";

export default async function SettingsPage() {
  // Fetch all settings upfront
  const storeIdentitySettings = await getSettingsByCategory(
    SettingCategory.STORE_IDENTITY
  );
  const operationalSettings = await getSettingsByCategory(
    SettingCategory.OPERATIONAL
  );

  // Create lookup object
  const settingsByCategory: Partial<
    Record<SettingCategory, Record<string, string>>
  > = {
    [SettingCategory.STORE_IDENTITY]: storeIdentitySettings,
    [SettingCategory.OPERATIONAL]: operationalSettings,
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue={CATEGORY_LIST[0]?.id}>
        <TabsList>
          {CATEGORY_LIST.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORY_LIST.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle>{category.label}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsFormContainer
                  category={category.id as SettingCategory}
                  settings={
                    settingsByCategory[category.id as SettingCategory] || {}
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
