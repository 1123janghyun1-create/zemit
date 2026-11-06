import EditProjectClient from "./EditProjectClient";

export const instant = false;

export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProjectClient projectId={id} />;
}
