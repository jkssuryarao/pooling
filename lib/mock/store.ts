"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSeedData, CURRENT_USER_ID } from "./seed";
import type {
  GenderPref,
  MockState,
  Notification,
  Ride,
  RideRequest,
  RideType,
  SearchParams,
  User,
} from "./types";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isInWindow(time: string, from: string, to: string) {
  const t = timeToMinutes(time);
  return t >= timeToMinutes(from) && t <= timeToMinutes(to);
}

function dayName(dateStr: string) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(dateStr + "T12:00:00").getDay()
  ];
}

interface Store extends MockState {
  reset: () => void;
  getUser: (id: string) => User | undefined;
  getVehicle: (id: string) => MockState["vehicles"][0] | undefined;
  searchRides: (
    params: SearchParams,
    seekerId: string,
    filters?: { rideType?: RideType | "ALL"; gender?: GenderPref | "ALL"; acOnly?: boolean }
  ) => Ride[];
  getSuggestedRides: (userId: string) => Ride[];
  getRideWithPoster: (rideId: string) => { ride: Ride; poster: User; vehicle?: MockState["vehicles"][0] } | null;
  sendRequest: (rideId: string, seekerId: string) => { ok: boolean; error?: string; requestId?: string };
  joinWaitlist: (rideId: string, seekerId: string) => { ok: boolean; error?: string };
  approveRequest: (requestId: string, posterId: string) => void;
  rejectRequest: (requestId: string, posterId: string) => void;
  cancelRide: (rideId: string, posterId: string) => void;
  createRide: (data: {
    posterId: string;
    rideType: RideType;
    date: string;
    departureTime: string;
    pickupLocality: string;
    totalSeats: number;
    isRecurring: boolean;
    recurringDays: string[];
    genderPref: GenderPref;
    deptRestriction: string | null;
    autoApproveDept: boolean;
    vehicleId?: string | null;
    cabNote?: string;
  }) => string;
  getMyRides: (posterId: string) => Ride[];
  getPendingRequestsForPoster: (posterId: string) => (RideRequest & { ride: Ride; seeker: User })[];
  getRequestForRide: (rideId: string, seekerId: string) => RideRequest | undefined;
  getWaitlistPosition: (rideId: string, seekerId: string) => number | null;
  sendMessage: (requestId: string, senderId: string, content: string) => void;
  getThreads: (userId: string) => { requestId: string; otherUser: User; ride: Ride; lastMessage: string; unread: boolean }[];
  getMessages: (requestId: string) => MockState["messages"];
  getOrCreateThread: (rideId: string, seekerId: string, posterId: string) => string;
  broadcast: (rideId: string, posterId: string, content: string) => void;
  getNotifications: (userId: string) => Notification[];
  markAllRead: (userId: string) => void;
  markRead: (notifId: string) => void;
  submitRating: (rideId: string, raterId: string, rateeId: string, stars: number) => void;
  resolveReport: (reportId: string, resolution: string) => void;
  broadcastAnnouncement: (message: string) => void;
  getAdminMetrics: () => {
    activeToday: number;
    participationRate: number;
    tripsThisMonth: number;
    topRoutes: { route: string; count: number }[];
  };
  exportCsv: () => string;
  importUsers: (rows: { employeeId: string; name: string; email: string; department: string; homeLocality: string; gender: "MALE" | "FEMALE"; password?: string }[]) => { added: number; updated: number; errors: string[] };
}

function pickState(s: MockState): MockState {
  return {
    users: s.users,
    vehicles: s.vehicles,
    rides: s.rides,
    requests: s.requests,
    messages: s.messages,
    notifications: s.notifications,
    ratings: s.ratings,
    reports: s.reports,
  };
}

function addNotification(
  state: MockState,
  n: Omit<Notification, "id" | "createdAt" | "isRead">
) {
  return {
    ...state,
    notifications: [
      {
        ...n,
        id: uid("notif"),
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...state.notifications,
    ],
  };
}

export const useRideStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createSeedData(),

      reset: () => set(createSeedData()),

      getUser: (id) => get().users.find((u) => u.id === id),

      getVehicle: (id) => get().vehicles.find((v) => v.id === id),

      searchRides: (params, seekerId, filters = {}) => {
        const { rides, requests, users } = get();
        const seeker = users.find((u) => u.id === seekerId);
        return rides.filter((ride) => {
          if (ride.status === "CANCELLED" || ride.status === "COMPLETED") return false;
          if (ride.date !== params.date) return false;
          if (!ride.pickupLocality.toLowerCase().includes(params.locality.toLowerCase()) && params.locality)
            return false;
          if (!isInWindow(ride.departureTime, params.timeFrom, params.timeTo)) return false;
          if (ride.genderPref !== "ANY" && seeker && ride.genderPref !== seeker.gender) return false;
          if (ride.deptRestriction && seeker && ride.deptRestriction !== seeker.department) return false;
          const existing = requests.find((r) => r.rideId === ride.id && r.seekerId === seekerId);
          if (existing && existing.status !== "CANCELLED_BY_SEEKER" && existing.status !== "REJECTED") {
            // still show if waitlisted or pending
          }
          if (filters.rideType && filters.rideType !== "ALL" && ride.rideType !== filters.rideType) return false;
          if (filters.gender && filters.gender !== "ALL" && ride.genderPref !== filters.gender) return false;
          if (filters.acOnly) {
            const v = ride.vehicleId ? get().vehicles.find((x) => x.id === ride.vehicleId) : null;
            if (!v?.isAc) return false;
          }
          return true;
        });
      },

      getSuggestedRides: (userId) => {
        const user = get().getUser(userId);
        if (!user) return [];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const date = tomorrow.toISOString().split("T")[0];
        return get()
          .searchRides(
            {
              date,
              locality: user.homeLocality,
              timeFrom: user.commuteTimeFrom,
              timeTo: user.commuteTimeTo,
            },
            userId
          )
          .slice(0, 3);
      },

      getRideWithPoster: (rideId) => {
        const ride = get().rides.find((r) => r.id === rideId);
        if (!ride) return null;
        const poster = get().getUser(ride.posterId);
        if (!poster) return null;
        const vehicle = ride.vehicleId ? get().getVehicle(ride.vehicleId) : undefined;
        return { ride, poster, vehicle };
      },

      sendRequest: (rideId, seekerId) => {
        const state = get();
        const ride = state.rides.find((r) => r.id === rideId);
        if (!ride) return { ok: false, error: "Ride not found" };
        const dup = state.requests.find(
          (r) => r.rideId === rideId && r.seekerId === seekerId && !["REJECTED", "CANCELLED_BY_SEEKER", "CANCELLED_BY_POSTER"].includes(r.status)
        );
        if (dup) return { ok: false, error: "You already have a request for this ride" };
        if (ride.availableSeats <= 0) return { ok: false, error: "Ride is full — join waitlist instead" };

        const seeker = state.getUser(seekerId);
        const poster = state.getUser(ride.posterId);
        const requestId = uid("req");
        const newReq: RideRequest = {
          id: requestId,
          rideId,
          seekerId,
          status: "PENDING",
          waitlistPosition: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        let next: MockState = { ...pickState(state), requests: [...state.requests, newReq] };
        if (ride.autoApproveDept && seeker && ride.deptRestriction === seeker.department) {
          next = {
            ...next,
            requests: next.requests.map((r) =>
              r.id === requestId ? { ...r, status: "APPROVED" as const, updatedAt: new Date().toISOString() } : r
            ),
            rides: next.rides.map((r) =>
              r.id === rideId
                ? {
                    ...r,
                    availableSeats: Math.max(0, r.availableSeats - 1),
                    status: r.availableSeats - 1 <= 0 ? ("FULL" as const) : r.status,
                  }
                : r
            ),
          };
        }

        next = addNotification(next, {
          userId: ride.posterId,
          type: "NEW_REQUEST",
          title: "New ride request",
          summary: `${seeker?.name ?? "Someone"} requested your ride on ${ride.date} at ${ride.departureTime}`,
          rideId,
          requestId,
        });

        set(next);
        return { ok: true, requestId };
      },

      joinWaitlist: (rideId, seekerId) => {
        const state = get();
        const ride = state.rides.find((r) => r.id === rideId);
        if (!ride) return { ok: false, error: "Ride not found" };
        const dup = state.requests.find(
          (r) => r.rideId === rideId && r.seekerId === seekerId && !["REJECTED", "CANCELLED_BY_SEEKER"].includes(r.status)
        );
        if (dup) return { ok: false, error: "Already on waitlist or requested" };
        const waitlisted = state.requests.filter((r) => r.rideId === rideId && r.status === "WAITLISTED");
        const pos = waitlisted.length + 1;
        const newReq: RideRequest = {
          id: uid("req"),
          rideId,
          seekerId,
          status: "WAITLISTED",
          waitlistPosition: pos,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ requests: [...state.requests, newReq] });
        return { ok: true };
      },

      approveRequest: (requestId, posterId) => {
        const state = get();
        const req = state.requests.find((r) => r.id === requestId);
        if (!req || req.status !== "PENDING") return;
        const ride = state.rides.find((r) => r.id === req.rideId);
        if (!ride || ride.posterId !== posterId || ride.availableSeats <= 0) return;

        let next: MockState = {
          ...pickState(state),
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status: "APPROVED", updatedAt: new Date().toISOString() } : r
          ),
          rides: state.rides.map((r) =>
            r.id === req.rideId
              ? {
                  ...r,
                  availableSeats: r.availableSeats - 1,
                  status: r.availableSeats - 1 <= 0 ? "FULL" : r.status,
                }
              : r
          ),
          messages: [
            ...state.messages,
            {
              id: uid("msg"),
              requestId,
              senderId: "system",
              content: "Request approved — you're confirmed for this ride.",
              sentAt: new Date().toISOString(),
              isBroadcast: false,
              isSystem: true,
            },
          ],
        };
        next = addNotification(next, {
          userId: req.seekerId,
          type: "REQUEST_APPROVED",
          title: "Request approved",
          summary: `Your request for the ride on ${ride.date} at ${ride.departureTime} was approved`,
          rideId: ride.id,
          requestId,
        });
        set(next);
      },

      rejectRequest: (requestId, posterId) => {
        const state = get();
        const req = state.requests.find((r) => r.id === requestId);
        if (!req) return;
        const ride = state.rides.find((r) => r.id === req.rideId);
        if (!ride || ride.posterId !== posterId) return;
        let next: MockState = {
          ...pickState(state),
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status: "REJECTED", updatedAt: new Date().toISOString() } : r
          ),
        };
        next = addNotification(next, {
          userId: req.seekerId,
          type: "REQUEST_REJECTED",
          title: "Request rejected",
          summary: `Your request for the ride on ${ride.date} was not approved`,
          rideId: ride.id,
          requestId,
        });
        set(next);
      },

      cancelRide: (rideId, posterId) => {
        const state = get();
        const ride = state.rides.find((r) => r.id === rideId);
        if (!ride || ride.posterId !== posterId) return;
        const affected = state.requests.filter(
          (r) => r.rideId === rideId && ["PENDING", "APPROVED", "WAITLISTED"].includes(r.status)
        );
        let next: MockState = {
          ...pickState(state),
          rides: state.rides.map((r) => (r.id === rideId ? { ...r, status: "CANCELLED" } : r)),
          requests: state.requests.map((r) =>
            r.rideId === rideId && ["PENDING", "APPROVED", "WAITLISTED"].includes(r.status)
              ? { ...r, status: "CANCELLED_BY_POSTER", updatedAt: new Date().toISOString() }
              : r
          ),
        };
        affected.forEach((req) => {
          next = addNotification(next, {
            userId: req.seekerId,
            type: "RIDE_CANCELLED",
            title: "Ride cancelled",
            summary: `The ride on ${ride.date} at ${ride.departureTime} from ${ride.pickupLocality} was cancelled`,
            rideId,
            requestId: req.id,
          });
        });
        set(next);
      },

      createRide: (data) => {
        const id = uid("ride");
        const rides: Ride[] = [];
        const base: Omit<Ride, "id" | "date"> = {
          posterId: data.posterId,
          vehicleId: data.vehicleId ?? null,
          rideType: data.rideType,
          departureTime: data.departureTime,
          pickupLocality: data.pickupLocality,
          destination: "Tally Office, Bengaluru",
          availableSeats: data.totalSeats,
          totalSeats: data.totalSeats,
          status: "OPEN",
          genderPref: data.genderPref,
          deptRestriction: data.deptRestriction,
          isRecurring: data.isRecurring,
          recurringDays: data.recurringDays,
          autoApproveDept: data.autoApproveDept,
          cabNote: data.cabNote,
        };

        if (data.isRecurring) {
          const start = new Date(data.date + "T12:00:00");
          for (let i = 0; i < 30; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dn = dayName(d.toISOString().split("T")[0]);
            if (data.recurringDays.includes(dn)) {
              rides.push({
                ...base,
                id: uid("ride"),
                date: d.toISOString().split("T")[0],
              });
            }
          }
        } else {
          rides.push({ ...base, id, date: data.date });
        }

        set((s) => ({ rides: [...rides, ...s.rides] }));
        return rides[0]?.id ?? id;
      },

      getMyRides: (posterId) =>
        get().rides.filter((r) => r.posterId === posterId).sort((a, b) => b.date.localeCompare(a.date)),

      getPendingRequestsForPoster: (posterId) => {
        const state = get();
        return state.requests
          .filter((r) => r.status === "PENDING")
          .map((r) => {
            const ride = state.rides.find((x) => x.id === r.rideId);
            const seeker = state.getUser(r.seekerId);
            if (!ride || !seeker || ride.posterId !== posterId) return null;
            return { ...r, ride, seeker };
          })
          .filter(Boolean) as (RideRequest & { ride: Ride; seeker: User })[];
      },

      getRequestForRide: (rideId, seekerId) =>
        get().requests.find(
          (r) =>
            r.rideId === rideId &&
            r.seekerId === seekerId &&
            !["REJECTED", "CANCELLED_BY_SEEKER", "CANCELLED_BY_POSTER"].includes(r.status)
        ),

      getWaitlistPosition: (rideId, seekerId) => {
        const req = get().requests.find(
          (r) => r.rideId === rideId && r.seekerId === seekerId && r.status === "WAITLISTED"
        );
        return req?.waitlistPosition ?? null;
      },

      sendMessage: (requestId, senderId, content) => {
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: uid("msg"),
              requestId,
              senderId,
              content,
              sentAt: new Date().toISOString(),
              isBroadcast: false,
              isSystem: false,
            },
          ],
        }));
      },

      getThreads: (userId) => {
        const state = get();
        const threadMap = new Map<string, ReturnType<Store["getThreads"]>[0]>();

        state.requests.forEach((req) => {
          const ride = state.rides.find((r) => r.id === req.rideId);
          if (!ride) return;
          const isPoster = ride.posterId === userId;
          const isSeeker = req.seekerId === userId;
          if (!isPoster && !isSeeker) return;
          const msgs = state.messages.filter((m) => m.requestId === req.id);
          if (msgs.length === 0 && req.status === "PENDING") return;
          const otherId = isPoster ? req.seekerId : ride.posterId;
          const otherUser = state.getUser(otherId);
          if (!otherUser) return;
          const last = msgs[msgs.length - 1];
          threadMap.set(req.id, {
            requestId: req.id,
            otherUser,
            ride,
            lastMessage: last?.content ?? "No messages yet",
            unread: false,
          });
        });

        return Array.from(threadMap.values()).sort((a, b) => b.ride.date.localeCompare(a.ride.date));
      },

      getMessages: (requestId) =>
        get()
          .messages.filter((m) => m.requestId === requestId)
          .sort((a, b) => a.sentAt.localeCompare(b.sentAt)),

      getOrCreateThread: (rideId, seekerId, posterId) => {
        const existing = get().requests.find(
          (r) =>
            r.rideId === rideId &&
            r.seekerId === seekerId &&
            !["REJECTED", "CANCELLED_BY_SEEKER", "CANCELLED_BY_POSTER"].includes(r.status)
        );
        if (existing) return existing.id;
        const requestId = uid("req");
        set((s) => ({
          requests: [
            ...s.requests,
            {
              id: requestId,
              rideId,
              seekerId,
              status: "PENDING",
              waitlistPosition: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }));
        return requestId;
      },

      broadcast: (rideId, posterId, content) => {
        const state = get();
        const approved = state.requests.filter(
          (r) => r.rideId === rideId && r.status === "APPROVED"
        );
        const newMsgs = approved.map((r) => ({
          id: uid("msg"),
          requestId: r.id,
          senderId: posterId,
          content,
          sentAt: new Date().toISOString(),
          isBroadcast: true,
          isSystem: false,
        }));
        set({ messages: [...state.messages, ...newMsgs] });
      },

      getNotifications: (userId) =>
        get()
          .notifications.filter((n) => n.userId === userId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      markAllRead: (userId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.userId === userId ? { ...n, isRead: true } : n
          ),
        })),

      markRead: (notifId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === notifId ? { ...n, isRead: true } : n
          ),
        })),

      submitRating: (rideId, raterId, rateeId, stars) => {
        set((s) => ({
          ratings: [
            ...s.ratings,
            {
              id: uid("rating"),
              rideId,
              raterId,
              rateeId,
              stars,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      resolveReport: (reportId, resolution) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === reportId ? { ...r, status: "RESOLVED", resolution } : r
          ),
        })),

      broadcastAnnouncement: (message) => {
        const state = get();
        const newNotifs = state.users
          .filter((u) => u.isActive)
          .map((u) => ({
            id: uid("notif"),
            userId: u.id,
            type: "ADMIN_ANNOUNCEMENT" as const,
            title: "Company announcement",
            summary: message.slice(0, 500),
            isRead: false,
            createdAt: new Date().toISOString(),
          }));
        set({ notifications: [...newNotifs, ...state.notifications] });
      },

      getAdminMetrics: () => {
        const state = get();
        const today = new Date().toISOString().split("T")[0];
        const activeToday = state.rides.filter(
          (r) => r.date === today && r.status !== "CANCELLED"
        ).length;
        const month = today.slice(0, 7);
        const tripsThisMonth = state.rides.filter(
          (r) => r.date.startsWith(month) && r.status === "COMPLETED"
        ).length;
        const ridersWithTrips = new Set(
          state.requests.filter((r) => r.status === "APPROVED").map((r) => r.seekerId)
        );
        const participationRate = Math.round(
          (ridersWithTrips.size / state.users.filter((u) => u.isActive).length) * 100
        );
        const routeMap: Record<string, number> = {};
        state.rides.forEach((r) => {
          if (r.status !== "CANCELLED") {
            routeMap[r.pickupLocality] = (routeMap[r.pickupLocality] || 0) + 1;
          }
        });
        const topRoutes = Object.entries(routeMap)
          .map(([route, count]) => ({ route, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        return { activeToday, participationRate, tripsThisMonth, topRoutes };
      },

      exportCsv: () => {
        const state = get();
        const header = "Date,Time,Locality,Poster,Type,Seats,Status\n";
        const rows = state.rides
          .map((r) => {
            const poster = state.getUser(r.posterId);
            return `${r.date},${r.departureTime},${r.pickupLocality},${poster?.name ?? ""},${r.rideType},${r.availableSeats}/${r.totalSeats},${r.status}`;
          })
          .join("\n");
        return header + rows;
      },

      importUsers: (rows) => {
        const errors: string[] = [];
        const added: User[] = [];
        let updated = 0;
        const users = get().users;
        const byEmployeeId = new Map(users.map((u) => [u.employeeId.toLowerCase(), u]));

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row.employeeId?.trim()) {
            errors.push(`Row ${i + 1}: missing employeeId`);
            continue;
          }
          if (!row.name?.trim()) {
            errors.push(`Row ${i + 1}: missing name`);
            continue;
          }

          const existing = byEmployeeId.get(row.employeeId.toLowerCase());
          if (existing) {
            updated++;
            byEmployeeId.set(row.employeeId.toLowerCase(), {
              ...existing,
              name: row.name.trim(),
              email: row.email.trim(),
              department: row.department.trim(),
              homeLocality: row.homeLocality.trim(),
              gender: row.gender,
            });
          } else {
            const user: User = {
              id: uid("user-import"),
              employeeId: row.employeeId.trim(),
              name: row.name.trim(),
              email: row.email.trim(),
              department: row.department.trim(),
              homeLocality: row.homeLocality.trim(),
              commuteDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
              commuteTimeFrom: "08:30",
              commuteTimeTo: "09:30",
              avgRating: 0,
              tripCount: 0,
              isVerified: true,
              isActive: true,
              gender: row.gender,
            };
            added.push(user);
            byEmployeeId.set(row.employeeId.toLowerCase(), user);
          }
        }

        if (added.length > 0 || updated > 0) {
          set({ users: Array.from(byEmployeeId.values()) });
        }
        return { added: added.length, updated, errors };
      },
    }),
    { name: "rideshare-mock-v1" }
  )
);

export { CURRENT_USER_ID };
