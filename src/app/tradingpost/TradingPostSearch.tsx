import { Box } from "@mui/material";

import TradeAdvert from "./TradeAdvert";
import { useTradingPostSearch } from "@/data/fetch/tradingpost/search";
import LoadingOverlay from "@/components/general/LoadingOverlay";

import type { Rarity } from "@/types/items";

type PropsType = {
  filter: string;
  rarity?: Rarity | null;
};

export default function TradingPostSearch(props: PropsType) {
  const { filter, rarity } = props;

  const {
    data: searchResults,
    isLoading,
    refreshSearch,
  } = useTradingPostSearch(filter);

  const filteredSearchResults = searchResults?.filter((advert) => {
    return advert.item.rarity === rarity || rarity == null;
  });

  return (
    <Box className="flex flex-wrap flex-row p-2 gap-2 items-center justify-evenly h-full">
      <LoadingOverlay open={isLoading} />
      {filteredSearchResults?.map((advert) => {
        return (
          <TradeAdvert
            {...advert}
            key={advert.uuid}
            market={true}
            onRemove={() => refreshSearch()}
          />
        );
      })}
    </Box>
  );
}
