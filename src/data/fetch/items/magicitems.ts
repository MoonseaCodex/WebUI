import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../base";

import type { UUID } from "@/types/uuid";
import type { MagicItem } from "@/types/items";
import { ItemEvent } from "@/types/events";

type CharUUID = { character_uuid: UUID };

function getMagicItemsFn(charUUID: UUID) {
  return api
    .get(`/api/data/magicitem`, { params: { character: charUUID } })
    .then((response) => {
      return response.data as MagicItem[];
    });
}

function getMagicItemFn(itemUUID: UUID) {
  return api.get(`/api/data/magicitem/${itemUUID}`).then((response) => {
    return response.data as MagicItem;
  });
}

function createMagicItemFn(
  item: Partial<MagicItem & CharUUID>,
  characterUUID?: UUID,
) {
  if (characterUUID) item.character_uuid = characterUUID;
  return api.post("/api/data/magicitem", item);
}

function updateMagicItemFn(item: Partial<MagicItem>) {
  return api.patch(`/api/data/magicitem/${item.uuid}`, item);
}

function deleteMagicItemFn(item: Partial<MagicItem>) {
  return api.delete(`/api/data/magicitem/${item.uuid}`);
}

/**********************************************************************************/

type ItemHistoryResponseType = {
  origin: ItemEvent;
  trades: ItemEvent[];
  edits: ItemEvent[];
};

function getMagicItemHistoryFn(uuid: UUID | null) {
  if (!uuid) return [];

  return api.get(`/api/data/magicitem/events/${uuid}`).then((response) => {
    const data = response.data as ItemHistoryResponseType;

    return [data.origin, ...data.trades, ...data.edits] as ItemEvent[];
  });
}

export function useMagicItemHistory(itemUUID: UUID | null) {
  const queryKey = ["items", "history", "individual", itemUUID];

  return useQuery({
    queryKey,
    queryFn: () => getMagicItemHistoryFn(itemUUID),
    enabled: !!itemUUID,
  });
}

/**********************************************************************************/
// TODO: This optimistic update code should be revisited once we have a "get items for this character" endpoint
export function useMagicItems(characterUUID: UUID) {
  const queryKey = ["items", "magic", "character", characterUUID];
  const queryClient = useQueryClient();

  const fetchData = useQuery({
    queryKey,
    queryFn: () => getMagicItemsFn(characterUUID),
  });

  const refreshItems = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const updateItem = useMutation({
    mutationFn: updateMagicItemFn,
    onSettled: () => {
      refreshItems();
    },
  });

  const createItem = useMutation({
    mutationFn: (item: Partial<MagicItem>) =>
      createMagicItemFn(item, characterUUID),
    onSettled: () => {
      refreshItems();
    },
  });

  const deleteItem = useMutation({
    mutationFn: deleteMagicItemFn,
    onSettled: (_item) => {
      refreshItems();
    },
  });

  return {
    ...fetchData,
    createItem: createItem.mutateAsync,
    updateItem: updateItem.mutateAsync,
    deleteItem: deleteItem.mutateAsync,
    refreshItems,
  };
}

export function useMagicItem(uuid: UUID, characterUUID?: UUID) {
  const queryKey = ["items", "magic", "individual", uuid];
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    if (characterUUID)
      queryClient.invalidateQueries({
        queryKey: ["items", "magic", "character", characterUUID],
      });
  };

  const fetchData = useQuery({
    queryKey,
    queryFn: () => getMagicItemFn(uuid),
  });

  const updateItem = useMutation({
    mutationFn: updateMagicItemFn,
    onMutate: async (newData: Partial<MagicItem>) => {
      await queryClient.cancelQueries({ queryKey });
      const oldData = queryClient.getQueryData(queryKey) as MagicItem;

      queryClient.setQueryData(queryKey, { ...oldData, ...newData });
      // Return a context with the old data and the new
      return { oldData, newItem: newData };
    },
    onError: (_err, _newChar: Partial<MagicItem>, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.oldData);
      }
    },
    onSettled: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: deleteMagicItemFn,
    onSettled: invalidate,
  });

  return {
    ...fetchData,
    updateItem: updateItem.mutateAsync,
    deleteItem: deleteItem.mutateAsync,
  };
}
