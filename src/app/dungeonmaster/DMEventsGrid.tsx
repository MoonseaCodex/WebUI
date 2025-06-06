"use client";

import React, { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { DataGrid, GridPagination } from "@mui/x-data-grid";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { GridActionsCellItem } from "@mui/x-data-grid";

import useSnackbar from "@/data/store/snackbar";
import { getDateString } from "@/utils/format";
import { useDMRewards } from "@/data/fetch/dmRewards";
import { useGames } from "@/data/fetch/games";

import DMGameModal from "./DMGameModal";

import type { GameEvent } from "@/types/events";
import type { DMEvent, EventType, DMRewardEvent } from "@/types/events";
import type { UUID } from "@/types/uuid";
import DMEventReward from "@/components/events/dm_event_panes/DMEventReward";

type PropsType = {
  uuid: UUID;
  allowUpdates: boolean;
};

export function DMEventsGrid(props: PropsType) {
  const { uuid, allowUpdates } = props;

  const displayMessage = useSnackbar((s) => s.displayMessage);
  const { data: dmRewards, deleteReward } = useDMRewards(uuid);
  const { data: dmGames, delete: deleteGame } = useGames({ dmUUID: uuid });

  let allDMEvents: DMEvent[] = [];
  allDMEvents = allDMEvents.concat(dmGames || []);
  allDMEvents = allDMEvents.concat(dmRewards || []);

  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [initialGameData, setInitialGameData] = useState<GameEvent>();
  const [editReward, setEditReward] = useState<DMRewardEvent>();

  const editItem = (event: DMEvent) => {
    if (event.event_type === "game") {
      setInitialGameData(event as GameEvent);
      setCreateEditOpen(true);
    } else if (event.event_type === "dm_reward") {
      setEditReward(event as DMRewardEvent);
    }
  };

  const deleteItem = (event: DMEvent) => {
    if (event.event_type === "game") {
      deleteGame(event as GameEvent).then(() => {
        displayMessage("Removed DMed game", "info");
      });
    } else if (event.event_type === "dm_reward") {
      deleteReward(event as DMRewardEvent).then(() => {
        displayMessage("Removed service reward", "info");
      });
    }
  };

  const getRowActions = (p: GridRowParams) => {
    return [
      <GridActionsCellItem
        icon={<EditIcon />}
        disabled={!allowUpdates}
        onClick={() => editItem(p.row)}
        label="Edit"
      />,
      <GridActionsCellItem
        icon={<DeleteIcon />}
        disabled={!allowUpdates}
        onClick={() => deleteItem(p.row)}
        label="Delete"
      />,
    ];
  };

  const rowType = (_val: EventType, event: DMEvent) => {
    if (event.event_type === "game") return "DMed game";
    if (event.event_type === "dm_reward") return "Service reward";
  };
  const rowDate = (val: string) => {
    let datetime = new Date(val);
    return getDateString(datetime);
  };
  const rowHours = (hours: number, event: DMEvent) => {
    if (event.event_type === "game") return hours;
    if (event.event_type === "dm_reward") return -hours;
    return "Error";
  };
  const rowDetails = (_val: string, event: DMEvent) => {
    if (event.event_type === "game") {
      event = event as GameEvent;
      return `${event.name} (${event.module})`;
    }
    if (event.event_type === "dm_reward") {
      event = event as DMRewardEvent;
      return `${event.name} given to ${event.character_items_assigned}`;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Event",
      flex: 0.15,
      headerAlign: "left",
      align: "left",
      valueGetter: rowType,
    },
    {
      field: "hours",
      headerName: "Service Hours",
      flex: 0.15,
      headerAlign: "left",
      align: "left",
      valueGetter: rowHours,
    },
    {
      field: "datetime",
      headerName: "Date",
      flex: 0.15,
      headerAlign: "left",

      valueGetter: rowDate,
    },
    {
      field: "details",
      headerName: "Details",
      flex: 0.6,
      headerAlign: "left",
      align: "left",
      valueGetter: rowDetails,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      minWidth: 80,
      headerAlign: "center",
      align: "center",
      getActions: getRowActions,
    },
  ];

  return (
    <React.Fragment>
      <DataGrid
        disableColumnMenu
        columns={columns}
        getRowId={(row) => row.uuid}
        rows={allDMEvents}
        rowHeight={36}
        sx={{ border: "1px solid black", borderRadius: "8px" }}
        initialState={{
          sorting: {
            sortModel: [{ field: "datetime", sort: "desc" }],
          },
        }}
        slots={{
          footer: () => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid black",
              }}
            >
              <div
                style={{
                  alignSelf: "center",
                  marginLeft: "0.4em",
                }}
              >
                <Button
                  disabled={!allowUpdates}
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setInitialGameData(undefined);
                    setCreateEditOpen(true);
                  }}
                >
                  Add Game
                </Button>
              </div>
              <GridPagination
                style={{
                  justifySelf: "center",
                  alignSelf: "center",
                }}
              />
            </div>
          ),
        }}
      />
      <DMGameModal
        uuid={uuid}
        open={createEditOpen}
        data={initialGameData ?? null}
        onSuccess={() => {}}
        onClose={() => setCreateEditOpen(false)}
      />

      <Dialog
        open={!!editReward}
        onClose={() => setEditReward(undefined)}
        slotProps={{
          paper: {
            sx: {
              width: "40em",
              border: "2px solid black",
              borderRadius: "16px",
              boxShadow: "2px 2px 60px black",
            },
          },
        }}
      >
        <DialogTitle>Service Reward</DialogTitle>
        <DialogContent>
          <DMEventReward
            event={editReward}
            onClose={() => setEditReward(undefined)}
          />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default DMEventsGrid;
