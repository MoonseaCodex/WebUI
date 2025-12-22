import { Button, ButtonGroup } from "@mui/material";

import { COLOUR_UC, COLOUR_R, COLOUR_VR, COLOUR_L } from "@/utils/items";
import type { Rarity } from "@/types/items";

type PropsType = {
  value: Rarity | null;
  setValue: (rarity: Rarity | null) => void;
  disabled?: boolean;
};

export function RarityFilter(props: PropsType) {
  const { value: rarityFilter, setValue: setRarityFilter } = props;

  return (
    <ButtonGroup variant="outlined" color="inherit" disabled={props.disabled}>
      <Button onClick={() => setRarityFilter(null)}>All</Button>
      <Button
        onClick={() => setRarityFilter("uncommon")}
        sx={{
          background: COLOUR_UC + (rarityFilter == "uncommon" ? "FF" : "60"),
        }}
      >
        UC
      </Button>
      <Button
        onClick={() => setRarityFilter("rare")}
        sx={{
          background: COLOUR_R + (rarityFilter == "rare" ? "FF" : "60"),
        }}
      >
        R
      </Button>
      <Button
        onClick={() => setRarityFilter("veryrare")}
        sx={{
          background: COLOUR_VR + (rarityFilter == "veryrare" ? "FF" : "60"),
        }}
      >
        VR
      </Button>
      <Button
        onClick={() => setRarityFilter("legendary")}
        sx={{
          background: COLOUR_L + (rarityFilter == "legendary" ? "FF" : "60"),
        }}
      >
        L
      </Button>
    </ButtonGroup>
  );
}

export default RarityFilter;
