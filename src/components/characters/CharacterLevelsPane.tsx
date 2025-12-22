import React, { useState } from "react";

import { Box, Button, Typography, Divider } from "@mui/material";

import useSnackbar from "@/data/store/snackbar";
import CharacterLevelEditDialog from "./CharacterLevelEditDialog";
import ClassChip from "./classes/ClassChip";

import { useCharacter } from "@/data/fetch/character";

import type { Character, PlayerClass } from "@/types/character";

type PropsType = {
  character: Character;
};

export default function CharacterLevelsPane(props: PropsType) {
  const { character } = props;
  const { classes, uuid, editable } = character;

  const { updateCharacter } = useCharacter(uuid);
  const displayMessage = useSnackbar((s) => s.displayMessage);

  const [levelOpen, setLevelOpen] = useState(false);

  const handleUpdate = (newVal: PlayerClass[]) => {
    if (classes === newVal) return;

    updateCharacter({ classes: newVal })
      .then((_charData) => {
        displayMessage("Updated character classes and levels", "info");
      })
      .catch(() => displayMessage("Error updating character classes", "error"));
  };

  const handleEditClose = () => {
    setLevelOpen(false);
  };

  const getClassChips = () => {
    let retVal: React.ReactElement[] = [];

    // exclude empty class entries (for example where no class was set on character creation)
    const playerClasses = classes.filter(c => c.name !== "");

    if (playerClasses) {
      retVal = playerClasses.map((item, index) => {
        return (
          <ClassChip
            playerClass={item}
            key={index}
            onClick={() => {
              if (editable) setLevelOpen(true);
            }}
          />
        );
      });
    }
    retVal = retVal.filter((x) => x !== null);
    if (retVal.length) return retVal;
    return (
      <Typography variant="caption" sx={{ opacity: 0.3 }}>
        Character has no class levels yet
      </Typography>
    );
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box width="100%" mb={"0.4em"}>
          <Divider sx={{ width: "95%" }}>
            {editable && (
              <Button
                variant="outlined"
                onClick={() => setLevelOpen(true)}
                size="small"
                color="primary"
                sx={{ alignSelf: "center", cursor: "pointer" }}
              >
                Manage classes and levels
              </Button>
            )}
          </Divider>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexFlow: "row wrap",
            justifyContent: "center",
            minHeight: "3em",
          }}
        >
          {getClassChips()}
        </Box>
      </Box>
      {levelOpen && (
        <CharacterLevelEditDialog
          open={levelOpen}
          onClose={handleEditClose}
          initialClasses={classes}
          update={handleUpdate}
        />
      )}
    </React.Fragment>
  );
}
