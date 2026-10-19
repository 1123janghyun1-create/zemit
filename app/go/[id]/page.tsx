import GoRedirectClient from "./GoRedirectClient";

export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default async function GoProjectRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GoRedirectClient projectId={id} />;
}
