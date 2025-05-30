"use client";

import api from "../base";
import { produce } from "immer";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { UUID } from "@/types/uuid";
import type { AnyEvent } from "@/types/events";
import { generateUUID } from "@/utils/uuid";

/******************************************************************/
function getEventsFn(characterUUID: UUID) {
  return api.get(`/api/data/character_events/${characterUUID}`).then((r) => {
    return r.data as AnyEvent[];
  });
}

function createEventFn(char: UUID, event: Partial<AnyEvent>) {
  event.character_uuid = char;

  switch (event.event_type) {
    case "dt_mtrade":
      return api.post("/api/data/mundanetrade", event);
    case "dt_catchingup":
      return api.post("/api/data/catchingup", event);
    case "dt_sbookupd":
      return api.post("/api/data/spellbook", event);
    case "dt_freeform":
      return api.post("/api/data/freeform", event);
    case "game":
      return api.post("/api/data/game", event);
    default:
      return Promise.resolve(null);
  }
}

function updateEventFn(event: Partial<AnyEvent>) {
  switch (event.event_type) {
    case "game":
      return api.patch(`/api/data/game/${event.uuid}`, event);
    case "dt_mtrade":
      return api.patch(`/api/data/mundanetrade/${event.uuid}`, event);
    case "dt_catchingup":
      return api.patch(`/api/data/catchingup/${event.uuid}`, event);
    case "dt_sbookupd":
      return api.patch(`/api/data/spellbook_update/${event.uuid}`, event);
    case "dt_freeform":
      return api.patch(`/api/data/freeform/${event.uuid}`, event);
    case "dm_reward":
      return api.patch(`/api/data/dm_reward/${event.uuid}`, event);
    default:
      return Promise.resolve(null);
  }
}

function deleteEventFn(event: AnyEvent, characterUUID: UUID) {
  switch (event.event_type) {
    case "dt_mtrade":
      return api.delete(`/api/data/mundanetrade/${event.uuid}`);
    case "dt_catchingup":
      return api.delete(`/api/data/catchingup/${event.uuid}`);
    case "dt_sbookupd":
      return api.delete(`/api/data/spellbook/${event.uuid}`);
    case "dt_freeform":
      return api.delete(`/api/data/freeform/${event.uuid}`);
    case "dm_reward":
      return api.delete(`/api/data/dm_reward/${event.uuid}`);
    case "game":
      // remove the specified character from the game
      return api.post(`/api/data/game/${event.uuid}/remove_character`, {
        character_uuid: characterUUID,
      });
    default:
      return Promise.resolve(null);
  }
}

/******************************************************************/
// Functions for doing optimistic updates to state
// function updateEventsData(data: AnyEvent[], element: Partial<AnyEvent>) {
//   const newState = produce(data, (draft) => {
//     const index = draft.findIndex((c) => c.uuid === element.uuid);
//     draft[index] = { ...draft[index], ...element };
//   });
//   return newState;
// }

function deleteEventData(data: AnyEvent[], deleted: AnyEvent) {
  const newState = produce(data, (draft) => {
    const index = draft.findIndex((c) => c.uuid === deleted.uuid);
    if (index !== -1) draft.splice(index, 1);
  });
  return newState;
}

/******************************************************************/
export function useEvents(characterUUID: UUID) {
  const queryClient = useQueryClient();
  const queryKey = ["events", "all", "character", characterUUID];

  const fetchData = useQuery({
    queryKey: queryKey,
    queryFn: () => getEventsFn(characterUUID),
  });

  const createEvent = useMutation({
    mutationFn: (data: Partial<AnyEvent>) => createEventFn(characterUUID, data),

    onMutate: async (event: Partial<AnyEvent>) => {
      // generate a temporary UUID to use with the optimistic update
      const newEvent = { ...event };
      newEvent.uuid = generateUUID();
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKey });
      const oldEvents = queryClient.getQueryData(queryKey) as any[];
      queryClient.setQueryData(queryKey, [...oldEvents, newEvent]);
      return { oldEvents };
    },
    // If the mutation fails, use the context we returned above
    onError: (_err, _newData: Partial<AnyEvent>, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.oldEvents);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({ queryKey: ["character", characterUUID] });
      queryClient.invalidateQueries({
        queryKey: ["items", "magic", "character", characterUUID],
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: (event: Partial<AnyEvent>) => updateEventFn(event),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (event: AnyEvent) => deleteEventFn(event, characterUUID),
    onMutate: async (deletedEvent: AnyEvent) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKey });
      const oldEvents = queryClient.getQueryData(queryKey) as any[];
      queryClient.setQueryData(
        queryKey,
        deleteEventData(oldEvents, deletedEvent),
      );
      return { oldEvents };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  return {
    ...fetchData,
    createEvent: createEvent.mutateAsync,
    updateEvent: updateEvent.mutateAsync,
    deleteEvent: deleteEvent.mutateAsync,
  };
}
