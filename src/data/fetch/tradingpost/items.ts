"use client";

import api from "../base";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UUID } from "@/types/uuid";
import type { Advert } from "@/types/trade";

/***************************************************************************/
async function getUserAdverts(): Promise<Advert[]> {
  return api.get("/api/data/magicitem/faesuggestion/?own=true").then((r) => {
    return r.data as Advert[];
  });
}

async function getAdvert(uuid: UUID): Promise<Advert> {
  return api.get(`/api/data/magicitem/faesuggestion/${uuid}`).then((r) => {
    return r.data as Advert;
  });
}

async function deleteAdvertFn(uuid: UUID) {
  return api.delete(`/api/data/magicitem/faesuggestion/${uuid}`);
}

async function createAdvertFn(itemUUID: UUID, text: string) {
  return api.post("/api/data/magicitem/faesuggestion", {
    item_uuid: itemUUID,
    description: text,
  });
}

/***************************************************************************/
export function useTradingPostAdvert(uuid: UUID) {
  const queryKey = ["tradingpost", "advert", uuid];

  const fetchData = useQuery({
    queryKey,
    queryFn: () => getAdvert(uuid),
  });

  const deleteAdvert = useMutation({
    mutationFn: () => deleteAdvertFn(uuid),
  });

  return { ...fetchData, deleteAdvert: deleteAdvert.mutateAsync };
}

/***************************************************************************/
export function useTradingPostAdverts() {
  const queryKey = ["tradingpost", "adverts", "own"];
  const queryClient = useQueryClient();

  const fetchData = useQuery({
    queryKey,
    queryFn: getUserAdverts,
  });

  const refreshItems = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const createAdvert = useMutation({
    mutationFn: (data: { itemUUID: UUID; text: string }) =>
      createAdvertFn(data.itemUUID, data.text),
    onSettled: () => refreshItems(),
  });

  return { ...fetchData, createAdvert: createAdvert.mutateAsync, refreshItems };
}
