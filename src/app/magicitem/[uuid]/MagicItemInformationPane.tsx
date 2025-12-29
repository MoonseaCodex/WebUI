import React, { useState } from "react";
import NextLink from "next/link";

import { Box, Paper, Typography, Divider } from "@mui/material";
import { Link as MUILink } from "@mui/material";

import { Rarity, type MagicItem } from "@/types/items";
import RarityWidget from "@/components/items/widgets/RarityWidget";

type PropsType = {
  item: MagicItem;
  editMode: boolean;
  setEditMode: (x: boolean) => void;
};

export default function MagicItemInformationPane(props: PropsType) {
  const { item } = props;

  const [name, _setName] = useState(item?.name || "");
  const [rpName, _setRPName] = useState(item?.rp_name || "");
  const [rarity, _setRarity] = useState<Rarity>(item?.rarity || "uncommon");
  const [minorProps, _setMinorProps] = useState(item?.minor_properties || "");
  const [_attunement, _setAttunement] = useState(item?.attunement || false);
  const [description, _setDescription] = useState(item?.description || "");
  const [flavour, _setFlavour] = useState(item?.flavour || "");
  const [url, _setURL] = useState(item?.url || "");

  // display nothing if item is invalid
  if (!item.uuid || !item.name) return null;

  const getNameText = () => {
    if (rpName) return `${rpName} - (${name})`;
    return name;
  };

  const getStatusText = () => {
    if (item.equipped) return "Item is currently equipped";
    else if (item.market) return "Item is available for trade";
    else return "Item is unused";
  };

  return (
    <Paper className="w-full flex flex-col rounded-md px-2">
      <Box className="flex gap-2">
        <Typography fontWeight={600}>Name:</Typography>
        <Typography>{getNameText()}</Typography>
      </Box>
      <Box className="flex gap-2">
        <Typography fontWeight={600}>Rarity:</Typography>
        <RarityWidget rarity={rarity} text />
      </Box>
      {minorProps !== "" && (
        <Box className="flex gap-2">
          <Typography fontWeight={600}>Additional Properties:</Typography>
          <Typography>{minorProps}</Typography>
        </Box>
      )}
      <Box className="flex gap-2">
        <Typography fontWeight={600}>Status:</Typography>
        <Typography>{getStatusText()}</Typography>
      </Box>
      <Box className="flex gap-2">
        <Typography fontWeight={600}>Owner:</Typography>
        <NextLink href={`/character/${item.owner_uuid}`}>
          <MUILink variant="body1" underline="always">
            {item.owner_name}
          </MUILink>
        </NextLink>
      </Box>
      {url !== "" && (
        <Box className="flex gap-2">
          <Typography fontWeight={600}>Reference URL:</Typography>
          <NextLink href={url}>
            <MUILink variant="body1" underline="always">
              {url}
            </MUILink>
          </NextLink>
        </Box>
      )}

      <Divider className="py-1" />
      <Box className="flex flex-col gap-2 mb-2">
        {description !== "" && (
          <React.Fragment>
            <Typography fontWeight={600}>Item Description:</Typography>
            <Typography fontStyle={"italic"} variant="body2">
              {description}
            </Typography>
          </React.Fragment>
        )}

        {flavour !== "" && (
          <React.Fragment>
            <Typography fontWeight={600}>Flavour text:</Typography>
            <Typography variant="body2" fontStyle={"italic"}>
              {flavour}
            </Typography>
          </React.Fragment>
        )}
      </Box>
    </Paper>
  );
}
