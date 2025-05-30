import { MagicItem, Consumable } from "./items";
import type { UUID } from "./uuid";

export type EventType =
  | "game"
  | "dm_reward"
  | "dt_freeform"
  | "dt_sbookupd"
  | "dt_mtrade"
  | "dt_catchingup"
  | "dt_bastion";
export type ItemEventType = "trade" | "manual" | "edit" | "game" | "dm_reward";

export type CharacterEvent = {
  uuid: UUID;
  character_uuid: UUID;
  event_type: EventType;
  datetime: string;
  editable: boolean;
};

export type FreeFormEvent = CharacterEvent & {
  title: string;
  details: string;
  gold_change: number;
  downtime_change: number;
  auto_apply?: boolean;
};

export type SpellBookUpdateEvent = CharacterEvent & {
  gold_change: number;
  dm_name: string;
  downtime: number;
  source: string;
  spellsText: string;
};

export type PartyMember = {
  name: string;
  uuid: UUID;
};

export type GameEvent = CharacterEvent & {
  name: string;
  event_type: EventType;
  dm_uuid?: UUID;
  dm_name: string;
  module: string;
  hours: number;
  hours_notes: string;
  location: string;
  downtime: number;
  gold: number;
  levels: number;
  magicitems: Partial<MagicItem>[];
  consumables: Partial<Consumable>[];
  notes: string;
  characters?: PartyMember[];
};

export type AnyEvent = GameEvent & FreeFormEvent & SpellBookUpdateEvent;

export type ItemEvent = {
  uuid: UUID;
  datetime: string;
  event_type: ItemEventType;
  name: string;
  character_name: string;
  details: string;
  recipient_name?: string;
  exchanged_item?: string;
  dm_name?: string;
  module?: string;
};

export type DMRewardEvent = {
  uuid: UUID;
  title?: string;
  event_type: EventType;
  datetime: string;
  editable: boolean;
  dm: string;
  name: string;
  gold: number;
  downtime: number;
  hours: number;
  character_level_assigned: number;
  character_items_assigned: number;
};

export type DMEvent = GameEvent | DMRewardEvent;
