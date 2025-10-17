import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_METADATA } from "@/constants/storeSettings";

export function SettingsTabs() {
  const categories = Object.entries(CATEGORY_METADATA).map(
    ([id, metadata]) => ({
      id,
      label: metadata.label,
      description: metadata.description,
    })
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue={categories[0]?.id}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle>{category.label}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                {/* Settings form will go here */}
                <p>Settings for {category.label} will appear here</p>
              </CardContent>
              <CardFooter>
                <Button>Save changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
