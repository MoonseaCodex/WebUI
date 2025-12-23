"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorBoundary } from "react-error-boundary";
import SearchIcon from "@mui/icons-material/Search";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { GridRenderCellParams as GRCellParams } from "@mui/x-data-grid";
import { Box, Paper, Dialog, IconButton, Tooltip } from "@mui/material";
import { TextField, Typography, InputAdornment } from "@mui/material";
import { Button } from "@mui/material";

import AuthenticationRequired from "@/components/user/AuthenticationRequired";
import ItemMarketWidget from "@/components/items/widgets/ItemMarketWidget";
import CreateAdvertDialog from "@/components/trade/CreateAdvertDialog";
import { useUserMagicItems } from "@/data/fetch/items/usermagicitems";
import RarityWidget from "@/components/items/widgets/RarityWidget";
import CharacterLinkWidget from "./widgets/CharacterLinkWidget";
import ItemLinkWidget from "./widgets/ItemLinkWidget";
import ItemSourceDialog from "./ItemSourceDialog";

import { getSourceText } from "@/utils/format";
import { raritySortComparitor } from "@/utils/sort";

import type { MagicItem, Rarity } from "types/items";
import RarityFilter from "@/components/trade/RarityFilter";

export default function ItemVault() {
  const router = useRouter();
  const { data: items, isLoading, refreshItems } = useUserMagicItems();

  const [itemSourceOpen, setItemSourceOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState<Rarity | null>(null);
  const [advertItem, setAdvertItem] = useState<MagicItem>();

  const getFilteredItems = (): MagicItem[] => {
    if (!items) return [];

    const filtered = items.filter((x) => {
      return (
        x.name.toLowerCase().includes(filter.toLowerCase()) &&
        (x.rarity == rarityFilter || rarityFilter === null)
      );
    });
    return filtered;
  };

  const rowSourceText = (item: MagicItem | undefined) => {
    try {
      if (item?.source_event_type) return getSourceText(item.source_event_type);
      return "";
    } catch (_error) {
      console.error(_error);
      return "";
    }
  };
  const rowStatusText = (_: boolean, item: MagicItem | undefined) => {
    try {
      if (item?.market) return "In trading post";
      if (item?.equipped) return "Equipped";
      return "Unused";
    } catch (_error) {
      console.error(_error);
      return "";
    }
  };

  const getRowActions = (params: any) => {
    const item = params.row as MagicItem;

    return (
      <React.Fragment>
        <ItemMarketWidget
          item={item}
          onAdd={() => {
            setAdvertItem(item);
          }}
          onRemove={() => {
            refreshItems();
          }}
        />
        {item.market && (
          <Tooltip title="View in trading post" placement="left">
            <IconButton onClick={() => router.push("/tradingpost/items/")}>
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        )}
      </React.Fragment>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "rarity",
      headerName: "Rarity",
      align: "center",
      sortComparator: raritySortComparitor,
      renderCell: (p: GRCellParams) => (
        <Box className="flex justify-center items-center h-full">
          <RarityWidget rarity={p.row.rarity} />
        </Box>
      ),
    },
    {
      field: "name",
      headerName: "Item",
      flex: 0.25,
      renderCell: (p: GRCellParams) => (
        <Box className="flex justify-start items-center h-full">
          <ItemLinkWidget name={p.row.name} uuid={p.row.uuid} />
        </Box>
      ),
    },
    {
      field: "owner_name",
      headerName: "Owner",
      flex: 0.15,
      renderCell: (p: GRCellParams) => (
        <Box className="flex justify-start items-center h-full">
          <CharacterLinkWidget
            name={p.row.owner_name}
            uuid={p.row.owner_uuid}
          />
        </Box>
      ),
    },
    {
      field: "source_event_type",
      headerName: "Source",
      flex: 0.2,
      valueGetter: rowSourceText,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.1,
      valueGetter: rowStatusText,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      renderCell: getRowActions,
    },
  ];

  return (
    <AuthenticationRequired>
      <Paper className="flex flex-col flex-grow px-2 pb-2 m-2">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          className="mt-2 mb-1"
        >
          <Typography variant="h5">Item Vault</Typography>

          <TextField
            label="Search my items"
            size="small"
            sx={{ width: "25em" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <RarityFilter value={rarityFilter} setValue={setRarityFilter} />

          <Tooltip title="Search over MSC's crowdsourced data for a module containing a specific item">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setItemSourceOpen(true)}
            >
              Munchkin search
            </Button>
          </Tooltip>
        </Box>

        <ErrorBoundary fallback="Error!">
          <Box className="flex-grow">
            <DataGrid
              getRowId={(r) => r.uuid}
              columns={columns}
              rows={getFilteredItems()}
              density="compact"
              loading={isLoading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } }, // Setting initial pageSize
                sorting: {
                  sortModel: [{ field: "status", sort: "asc" }],
                },
              }}
              sx={{
                border: "1px solid black",
                minHeight: "calc(100vh - 9em)",
              }}
            />
          </Box>
        </ErrorBoundary>
        <ErrorBoundary fallback="Error in dialogs">
          <Dialog
            open={createOpen}
            onClose={() => {
              setCreateOpen(false);
            }}
          />

          <CreateAdvertDialog
            open={!!advertItem}
            onClose={() => setAdvertItem(undefined)}
            onCreate={() => {
              refreshItems();
            }}
            item={advertItem}
          />
          <ItemSourceDialog
            open={itemSourceOpen}
            onClose={() => setItemSourceOpen(false)}
          />
        </ErrorBoundary>
      </Paper>
    </AuthenticationRequired>
  );
}
