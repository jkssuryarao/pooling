import MessageThreadClient from "./MessageThreadClient";

export function generateStaticParams() {
  return [
    { threadId: "req-1" },
    { threadId: "req-2" },
  ];
}

export default function Page({ params }: { params: Promise<{ threadId: string }> }) {
  return <MessageThreadClient params={params} />;
}
