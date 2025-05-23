import React, { useState } from "react";

import { Dialog, Box, Typography, SelectChangeEvent } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Divider, Button } from "@mui/material";

import useSnackBar from "@/data/store/snackbar";

import { useCharacters } from "@/data/fetch/character";
import { useDMRewards } from "@/data/fetch/dmRewards";
import { getRarityColour } from "@/utils/items";

import RewardSelectWidget from "./RewardSelectWidget";

import type { UUID } from "@/types/uuid";
import type { DMServiceReward } from "@/types/dm";
import type { Character } from "@/types/character";

type PropsType = {
  open: boolean;
  dmUUID: UUID;
  onClose: () => void;
  onChange: () => void;
  data?: DMServiceReward;
};

export function SelectDMServiceReward(props: PropsType) {
  const { data, open, onClose, onChange, dmUUID } = props;

  const displayMessage = useSnackBar((s) => s.displayMessage);
  const { data: characters } = useCharacters();
  const { create: createDMReward } = useDMRewards(dmUUID);

  const [levelChar, setLevelChar] = useState<UUID>();
  const [rewardChar, setRewardChar] = useState<UUID>();
  const [rewardItem, setRewardItem] = useState(0);
  const [rewardText, setRewardText] = useState("");

  const handleSubmit = () => {
    let temp = {
      name: data?.name,
      hours: data?.cost,
      gold: data?.gold,
      downtime: data?.downtime,
      levels: data?.level,
      rarity: data?.rarity,
      charLevels: levelChar,
      charItems: rewardChar,
      item: "",
    };
    if (typeof data?.rewards === "string") {
      temp["item"] = rewardText;
    } else {
      temp["item"] = data?.rewards[rewardItem] || "";
    }
    createDMReward(temp)
      .then(() => {
        displayMessage(
          `Purchased DM reward for ${data?.cost} hours`,
          "success",
        );
        onChange();
        onClose();
      })
      .catch((_err) => {
        displayMessage(`Failed to claim DM reward`, "error");
      });
  };

  const getRewardText = () => {
    let retval = "Misc rewards:";
    if (data?.gold) retval += ` ${data.gold} GP`;
    if (data?.downtime) retval += ` ${data.downtime} downtime days`;

    return retval;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "8px",
            border: `2px solid ${getRarityColour(data?.rarity || "common")}`,
            boxShadow: `0 0 64px ${getRarityColour(data?.rarity || "common")}`,
            display: "flex",
            minWidth: "42em",
            flexDirection: "column",
            alignItems: "center",
            padding: "1em 2em",
          },
        },
      }}
    >
      <Typography variant="h4" mb="0.4em">
        DM Reward: {data?.name}
      </Typography>
      {data?.level && (
        <React.Fragment>
          <Divider sx={{ width: "95%", margin: "0.4em 0" }}>
            <Typography variant="body2">Character Advancement</Typography>
          </Divider>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormControl>
              <InputLabel>Character to level up</InputLabel>
              <Select
                sx={{
                  width: "16em",
                  justifySelf: "flex-start",
                }}
                label="Character to level up"
                value={levelChar}
                onChange={(e: SelectChangeEvent<UUID>) =>
                  setLevelChar(e.target.value as UUID)
                }
              >
                <MenuItem value={0} divider>
                  None - skip level up
                </MenuItem>
                {characters?.map((char: Character) => (
                  <MenuItem value={char.uuid} key={char.uuid}>
                    {char.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" sx={{ opacity: "0.8" }}>
                Optional level up for any character
              </Typography>
            </Box>
          </Box>
        </React.Fragment>
      )}
      <Divider sx={{ width: "95%", margin: "0.4em 0" }}>
        <Typography variant="body2">Item rewards</Typography>
      </Divider>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormControl>
          <InputLabel>Character to recieve items</InputLabel>

          <Select
            sx={{ width: "16em", justifySelf: "flex-start" }}
            label="Character to recieve items"
            value={rewardChar}
            onChange={(e: SelectChangeEvent<UUID>) =>
              setRewardChar(e.target.value as UUID)
            }
          >
            <MenuItem value={0} divider disabled>
              None - skip item rewards
            </MenuItem>
            {characters?.map((char) => (
              <MenuItem value={char.uuid} key={char.uuid}>
                {char.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <RewardSelectWidget
          value={rewardItem}
          setValue={setRewardItem}
          text={rewardText}
          setText={setRewardText}
          rewards={data?.rewards || ""}
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          margin: "0.6em",
        }}
      >
        <Typography variant="body2" sx={{ opacity: "0.8" }}>
          {getRewardText()}
        </Typography>
      </Box>
      <Button
        variant="contained"
        sx={{ marginBottom: "1em", width: "50%" }}
        onClick={handleSubmit}
        disabled={!rewardChar}
      >{`Claim reward (${data?.cost} hours)`}</Button>
    </Dialog>
  );
}

export default SelectDMServiceReward;
