"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Badges";
import { useMessageThreads } from "@/lib/mock/hooks";
import { useAuth } from "@/lib/auth-store";
import { formatDate } from "@/lib/utils";

export default function MessagesPage() {
  const { data: session } = useAuth();
  const userId = session?.user?.id ?? "";
  const threads = useMessageThreads(userId);

  return (
    <AppShell title="Messages">
      {threads.length === 0 ? (
        <div className="rounded border border-border bg-surface p-8 text-center">
          <p className="font-medium">No conversations yet</p>
          <p className="mt-1 text-sm text-text-muted">Request a ride or respond to a request to start messaging.</p>
          <Link href="/search" className="mt-3 inline-block text-sm text-accent">Go to search</Link>
        </div>
      ) : (
        <div className="space-y-1">
          {threads.map((t) => (
            <Link
              key={t.requestId}
              href={`/messages/${t.requestId}`}
              className="flex items-center gap-3 rounded border border-border bg-surface p-3 hover:bg-surface-subtle"
            >
              <Avatar name={t.otherUser.name} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{t.otherUser.name}</div>
                <div className="text-xs text-text-muted">
                  Re: {formatDate(t.ride.date)} · {t.ride.departureTime}
                </div>
                <div className="truncate text-sm text-text-muted">{t.lastMessage}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
