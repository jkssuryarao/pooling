import { Suspense } from "react";
import SearchPage from "./SearchContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm text-text-muted">Loading…</div>}>
      <SearchPage />
    </Suspense>
  );
}
