import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmailTemplate } from "@/lib/supabase";
import { TemplateEditor } from "../template-editor";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let template = null;
  try {
    template = await getEmailTemplate(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Email Template</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Template</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateEditor template={template} />
        </CardContent>
      </Card>
    </div>
  );
}
