"use client";

import { use, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useRideStore } from "@/lib/mock/store";
import { useStoreUser, useThreadMessages } from "@/lib/mock/hooks";
import { formatDate } from "@/lib/utils";

export default function MessageThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  const { data: session } = useAuth();
  const userId = session?.user?.id ?? "";
  const messages = useThreadMessages(threadId);
  const sendMessage = useRideStore((s) => s.sendMessage);
  const requests = useRideStore((s) => s.requests);
  const rides = useRideStore((s) => s.rides);
  const [text, setText] = useState("");

  const req = requests.find((r) => r.id === threadId);
  const ride = req ? rides.find((r) => r.id === req.rideId) : null;
  const otherId = req && ride ? (ride.posterId === userId ? req.seekerId : ride.posterId) : "";
  const other = useStoreUser(otherId);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(threadId, userId, text.trim());
    setText("");
  }

  return (
    <AppShell title={other?.name ?? "Chat"}>
      <Link href="/messages" className="mb-3 inline-block text-sm text-accent">← Messages</Link>
      {ride && (
        <p className="mb-3 text-xs text-text-muted">
          Re: {formatDate(ride.date)} · {ride.departureTime} ride
        </p>
      )}

      <div className="mb-4 flex max-h-[50vh] flex-col gap-2 overflow-y-auto rounded border border-border bg-surface-subtle p-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-text-muted">Start the conversation</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === userId;
          if (m.isSystem) {
            return (
              <div key={m.id} className="rounded bg-success-light px-3 py-2 text-center text-xs text-success">
                {m.content}
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded px-3 py-2 text-sm ${
                  mine ? "bg-accent text-white" : "bg-surface border border-border"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded border border-border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white" aria-label="Send">
          →
        </button>
      </form>
      <p className="mt-2 text-[11px] text-text-faint">Phone numbers are never shared in RideShare.</p>
    </AppShell>
  );
}
