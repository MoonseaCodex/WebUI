"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Box, Button, ButtonGroup } from "@mui/material";

import CreateCharacterWindow from "@/components/characters/CreateCharacterWindow";
import CharacterSummaryCard from "@/components/characters/summary/CharacterSummaryCard";
import ImportCharacterDialog from "@/components/characters/import/ImportCharacter";
import NoCharactersOverlay from "@/components/characters/NoCharactersOverlay";
import AuthenticationRequired from "@/components/user/AuthenticationRequired";
import LoadingOverlay from "@/components/general/LoadingOverlay";
import { useCharacters } from "@/data/fetch/character";
import { useUserStatus } from "@/data/fetch/auth";

export default function Dashboard() {
  const { data: userStatus, isLoading: checkingAuth } = useUserStatus();
  const { data: characters, isLoading } = useCharacters();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  if (!checkingAuth && !userStatus?.authenticated) {
    router.push("/auth/login");
    return null;
  }
  if (isLoading) return <LoadingOverlay open={true} />;

  return (
    <AuthenticationRequired>
      <Box
        sx={{
          margin: "0.8em",
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-evenly",
          alignItems: "center",
          flexGrow: 1,
          gap: "0.8em",
          paddingBottom: "1.4em",
        }}
      >
        {characters?.length === 0 && (
          <NoCharactersOverlay
            onCreateClick={() => setCreateOpen(true)}
            onImportClick={() => setImportOpen(true)}
          />
        )}
        {characters
          ?.sort((a, b) => {
            return a.level - b.level;
          })
          ?.map((character: any) => (
            <CharacterSummaryCard key={character.uuid} character={character} />
          ))}
      </Box>
      <ButtonGroup className="fixed bottom-4 right-4">
        <Button
          size="large"
          variant="contained"
          className="rounded-l-3xl"
          onClick={() => setImportOpen(true)}
        >
          Import
        </Button>
        <Button
          size="large"
          variant="contained"
          className="rounded-r-3xl"
          onClick={() => setCreateOpen(true)}
        >
          Create
        </Button>
      </ButtonGroup>

      <ImportCharacterDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
      <CreateCharacterWindow
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </AuthenticationRequired>
  );
}
