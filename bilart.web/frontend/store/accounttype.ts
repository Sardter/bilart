import React from "react";
import {atom, useAtom} from "jotai";

export type AccountType = "artist" | "collector"


export const accountTypeAtom = atom<AccountType>("artist");

export const useArtistAccountType = () => {
  const [_, setAccountType] = useAtom(accountTypeAtom);
  React.useEffect(() => {
    setAccountType("artist");
  }, []);
}


export const useCollectorAccountType = () => {
  const [_, setAccountType] = useAtom(accountTypeAtom);
  React.useEffect(() => {
    setAccountType("collector");
  }, []);
}

export const useToggleAccountType = () => {
  const [_, setAccountType] = useAtom(accountTypeAtom);
  const toggle = React.useCallback(() => {
    setAccountType(prev => {
      if (prev === "artist") return "collector";
      return "artist";
    })
  }, []);

  return toggle;
}