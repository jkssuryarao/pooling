import RideDetailClient from "./RideDetailClient";

export function generateStaticParams() {
  return [
    { id: "ride-1" },
    { id: "ride-2" },
    { id: "ride-3" },
    { id: "ride-4" },
    { id: "ride-5" },
    { id: "ride-6" },
    { id: "ride-7" },
  ];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <RideDetailClient params={params} />;
}
