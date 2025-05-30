import { MouseEventHandler } from "react";

import { Box, Button } from "@mui/material";
import { GridPagination, GridSlotsComponentsProps } from "@mui/x-data-grid";

export function AdventuringGearGridFooter(
  props: NonNullable<GridSlotsComponentsProps["footer"]>,
) {
  const { onClick } = props;

  return (
    <Box
      className="flex px-1 py-1 h-11 items-center"
      sx={{ borderTop: "1px solid black" }}
    >
      <Button
        sx={{ pointerEvents: "auto" }}
        variant="outlined"
        onClick={onClick as MouseEventHandler<any>}
      >
        Add gear
      </Button>
      <GridPagination className="flex items-center justify-end no-scrollbar overflow-hidden" />
    </Box>
  );
}

export default AdventuringGearGridFooter;
