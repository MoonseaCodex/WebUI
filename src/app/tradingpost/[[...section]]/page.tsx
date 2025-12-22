"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Box, Typography, TextField } from "@mui/material";
import { Button, ButtonGroup, InputAdornment, Paper } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import HikingIcon from "@mui/icons-material/Hiking";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";

import TradingPostOffers from "../TradingPostOffers";
import TradingPostSearch from "../TradingPostSearch";
import TradingPostItems from "../TradingPostItems";
import RarityFilter from "@/components/trade/RarityFilter";
import AuthenticationRequired from "@/components/user/AuthenticationRequired";
import { useUserStatus } from "@/data/fetch/auth";

import type { Rarity } from "@/types/items";

export default function TradingPostWindow() {
  const { data: userStatus } = useUserStatus();
  const { section } = useParams();
  const router = useRouter();

  const [filter, setFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState<Rarity | null>(null);

  const tabValue = (section?.[0] as string) ?? "market";

  useEffect(() => {
    if (!section) router.push("/tradingpost/market/");
  }, [router, section]);

  return (
    <AuthenticationRequired>
      <Paper
        className="flex flex-col flex-grow px-2 pb-2 m-2"
        sx={{ minHeight: "calc(100vh - 6em)" }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          margin="0.5em 0"
        >
          <Typography variant="h5">Trading Post</Typography>

          <TextField
            disabled={tabValue !== "market"}
            label="Search the trading post"
            variant="outlined"
            size="small"
            sx={{ width: "25em" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <RarityFilter
            value={rarityFilter}
            setValue={setRarityFilter}
            disabled={tabValue !== "market"}
          />

          <ButtonGroup>
            <Button
              disabled={!userStatus?.authenticated}
              size="large"
              startIcon={<HikingIcon />}
              component={Link}
              href={"/tradingpost/items/"}
              sx={{ opacity: tabValue === "items" ? 1 : 0.4 }}
            >
              My Items
            </Button>
            <Button
              disabled={!userStatus?.authenticated}
              component={Link}
              href={"/tradingpost/offers/"}
              sx={{ opacity: tabValue === "offers" ? 1 : 0.4 }}
            >
              Pending Offers
            </Button>
            <Button
              endIcon={<LocalGroceryStoreIcon />}
              component={Link}
              href={"/tradingpost/market/"}
              sx={{ opacity: tabValue === "market" ? 1 : 0.4 }}
            >
              Market
            </Button>
          </ButtonGroup>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            border: "1px solid black",
            borderRadius: "8px",
          }}
        >
          {tabValue === "items" && <TradingPostItems />}
          {tabValue === "offers" && <TradingPostOffers />}
          {tabValue === "market" && (
            <TradingPostSearch filter={filter} rarity={rarityFilter} />
          )}
        </Box>
      </Paper>
    </AuthenticationRequired>
  );
}
