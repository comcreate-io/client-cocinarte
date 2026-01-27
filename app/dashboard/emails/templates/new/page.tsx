import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateEditor } from "../template-editor";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Email Template</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateEditor />
        </CardContent>
      </Card>
    </div>
  );
}
