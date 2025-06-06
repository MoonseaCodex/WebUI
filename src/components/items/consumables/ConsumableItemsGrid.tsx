"use client";

import React, { ChangeEvent, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import TextsmsIcon from "@mui/icons-material/Textsms";

import { Box, Checkbox, IconButton, Typography, Tooltip } from "@mui/material";
import { Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { GridRenderCellParams, GridPagination } from "@mui/x-data-grid";

import { useConsumables } from "@/data/fetch/items/consumables";
import { getNumberEquipped } from "@/utils/items";
import useSnackbar from "@/data/store/snackbar";

import { ConsumableTypeWidget } from "../widgets/ConsumableTypeWidget";
import ConsumableDetailsDialog from "./ConsumableDetailsDialog";
import CreateConsumableDialog from "./CreateConsumableDialog";
import NoItemsOverlay from "../widgets/NoItemsOverlay";
import RarityWidget from "../widgets/RarityWidget";

import type { UUID } from "@/types/uuid";
import type { Consumable } from "@/types/items";

type PropsType = {
  characterUUID: UUID;
  editable: boolean;
};

export function ConsumableItemsGrid(props: PropsType) {
  const { characterUUID, editable } = props;

  const { displayMessage } = useSnackbar();
  const {
    data: consumableItems,
    updateConsumable,
    deleteConsumable,
    createConsumable,
  } = useConsumables(characterUUID);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editConsumable, setEditConsumable] = useState<Consumable | null>(null);

  const renderEquipped = (p: GridRenderCellParams<Consumable>) => {
    return (
      <Box className="flex items-center h-full w-full justify-center">
        <Checkbox
          checked={p.row.equipped}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            updateConsumable({
              uuid: p.row.uuid,
              equipped: !!event.target.checked,
            });
          }}
        />
      </Box>
    );
  };

  const addConsumable = (newConsumable: Partial<Consumable>) => {
    createConsumable(newConsumable)
      .then((response) => {
        displayMessage(`Added ${response.data.name}`, "success");
      })
      .catch((_error) => {
        displayMessage("Error adding consumable to character", "error");
      });
  };

  const getRowActions = (p: GridRenderCellParams<Consumable>) => {
    //if (!p.row.editable) return null;

    return (
      <Box className="flex items-center justify-end">
        <IconButton onClick={() => setEditConsumable(p.row)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={() => {
            deleteConsumable(p.row).then(() =>
              displayMessage(`Removed ${p.row.name}`, "info"),
            );
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const columns: GridColDef<Consumable>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 5,
    },
    {
      field: "description",
      flex: 1,
      headerName: "",
      renderCell: (p) => {
        return (
          <Box className="flex w-full items-center h-full justify-center">
            <Tooltip arrow placement="bottom" title={p.row.description}>
              <TextsmsIcon
                fontSize="small"
                className={p.row.description ? "" : "opacity-20"}
              />
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      flex: 2,
      renderCell: (p) => {
        return <ConsumableTypeWidget type={p.row.type} />;
      },
    },
    {
      field: "rarity",
      headerName: "Rarity",
      flex: 2,
      renderCell: (p) => {
        return (
          <Box className="flex items-center h-full">
            <RarityWidget rarity={p.row.rarity} text />
          </Box>
        );
      },
    },
    {
      field: "charges",
      headerName: "Charges",
      flex: 3,
      renderCell: (p) => {
        return (
          <Box className="flex items-center justify-between">
            <IconButton
              onClick={() => {
                updateConsumable({
                  uuid: p.row.uuid,
                  charges: (p.row.charges ?? 0) - 1,
                });
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1">{p.row.charges}</Typography>
            <IconButton
              onClick={() => {
                updateConsumable({
                  uuid: p.row.uuid,
                  charges: (p.row.charges ?? 0) + 1,
                });
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: "equipped",
      headerName: `Equipped ${getNumberEquipped(consumableItems)}`,
      flex: 2,
      renderCell: renderEquipped,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      minWidth: 130,
      headerAlign: "center",
      renderCell: getRowActions,
    },
  ];

  return (
    <React.Fragment>
      <DataGrid
        autoPageSize
        getRowId={(x) => x.uuid}
        columns={columns}
        rows={consumableItems}
        initialState={{
          sorting: {
            sortModel: [{ field: "equipped", sort: "desc" }],
          },
          columns: {
            columnVisibilityModel: { description: true },
          },
        }}
        slots={{
          footer: () => (
            <Box
              className="flex px-1 py-1 h-11 items-center"
              sx={{ borderTop: "1px solid black" }}
            >
              <Button
                sx={{ pointerEvents: "auto" }}
                variant="outlined"
                disabled={!editable}
                onClick={() => setDialogOpen(true)}
              >
                Add consumable
              </Button>
              <GridPagination className="flex items-center justify-end no-scrollbar overflow-hidden" />
            </Box>
          ),
          noRowsOverlay: NoItemsOverlay as any,
        }}
        density="compact"
      />
      <ConsumableDetailsDialog
        open={!!editConsumable}
        onClose={() => {
          setDialogOpen(false);
          setEditConsumable(null);
        }}
        characterUUID={characterUUID}
        consumable={editConsumable}
      />
      <CreateConsumableDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        addItem={(newVal) => {
          addConsumable(newVal);
          setDialogOpen(false);
        }}
      />
    </React.Fragment>
  );
}

export default ConsumableItemsGrid;
