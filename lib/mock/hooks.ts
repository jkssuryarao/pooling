import { useMemo } from "react";
import { useRideStore } from "./store";
import type { Ride, User, Vehicle } from "./types";

/** Stable user lookup — subscribes to users slice only */
export function useStoreUser(userId: string): User | undefined {
  return useRideStore((s) => s.users.find((u) => u.id === userId));
}

/** Stable suggested rides — recomputes only when underlying data changes */
export function useSuggestedRides(userId: string): Ride[] {
  const rides = useRideStore((s) => s.rides);
  const users = useRideStore((s) => s.users);
  const requests = useRideStore((s) => s.requests);
  return useMemo(() => {
    if (!userId) return [];
    return useRideStore.getState().getSuggestedRides(userId);
  }, [userId, rides, users, requests]);
}

export function useRideWithPoster(rideId: string) {
  const ride = useRideStore((s) => s.rides.find((r) => r.id === rideId));
  const poster = useRideStore((s) => {
    const r = s.rides.find((x) => x.id === rideId);
    return r ? s.users.find((u) => u.id === r.posterId) : undefined;
  });
  const vehicle = useRideStore((s) => {
    const r = s.rides.find((x) => x.id === rideId);
    return r?.vehicleId ? s.vehicles.find((v) => v.id === r.vehicleId) : undefined;
  });
  return useMemo(() => {
    if (!ride || !poster) return null;
    return { ride, poster, vehicle };
  }, [ride, poster, vehicle]);
}

export function useUserNotifications(userId: string) {
  const notifications = useRideStore((s) => s.notifications);
  return useMemo(
    () =>
      useRideStore
        .getState()
        .getNotifications(userId),
    [notifications, userId]
  );
}

export function useMessageThreads(userId: string) {
  const rides = useRideStore((s) => s.rides);
  const requests = useRideStore((s) => s.requests);
  const messages = useRideStore((s) => s.messages);
  const users = useRideStore((s) => s.users);
  return useMemo(() => {
    if (!userId) return [];
    return useRideStore.getState().getThreads(userId);
  }, [userId, rides, requests, messages, users]);
}

export function useThreadMessages(requestId: string) {
  const messages = useRideStore((s) => s.messages);
  return useMemo(
    () => useRideStore.getState().getMessages(requestId),
    [messages, requestId]
  );
}

export function useUserVehicles(userId: string): Vehicle[] {
  const vehicles = useRideStore((s) => s.vehicles);
  return useMemo(
    () => vehicles.filter((v) => v.ownerId === userId),
    [vehicles, userId]
  );
}

export function useAdminMetrics() {
  const rides = useRideStore((s) => s.rides);
  const users = useRideStore((s) => s.users);
  const requests = useRideStore((s) => s.requests);
  return useMemo(() => useRideStore.getState().getAdminMetrics(), [rides, users, requests]);
}

export function useMyRides(posterId: string): Ride[] {
  const rides = useRideStore((s) => s.rides);
  return useMemo(() => {
    if (!posterId) return [];
    return useRideStore.getState().getMyRides(posterId);
  }, [rides, posterId]);
}

export function usePendingRequests(posterId: string) {
  const rides = useRideStore((s) => s.rides);
  const requests = useRideStore((s) => s.requests);
  const users = useRideStore((s) => s.users);
  return useMemo(() => {
    if (!posterId) return [];
    return useRideStore.getState().getPendingRequestsForPoster(posterId);
  }, [rides, requests, users, posterId]);
}

export function useSearchResults(
  userId: string,
  params: { date: string; locality: string; timeFrom: string; timeTo: string },
  filters: { rideType?: "CAR" | "CAB"; gender?: "ANY" | "MALE" | "FEMALE"; acOnly?: boolean }
) {
  const rides = useRideStore((s) => s.rides);
  const users = useRideStore((s) => s.users);
  const requests = useRideStore((s) => s.requests);
  const vehicles = useRideStore((s) => s.vehicles);
  return useMemo(
    () => useRideStore.getState().searchRides(params, userId, filters),
    [rides, users, requests, vehicles, userId, params.date, params.locality, params.timeFrom, params.timeTo, filters.rideType, filters.gender, filters.acOnly]
  );
}
