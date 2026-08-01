import { createContext, useContext, type ReactNode } from "react";

import {
  type IsoHand,
  type IsoPerspective,
  withIsoHand,
  withIsoPerspective,
} from "./iso";

type IsoCamera = { hand: IsoHand; perspective: IsoPerspective };

const IsoCameraContext = createContext<IsoCamera>({ hand: 1, perspective: "iso" });

export function IsoHandProvider({
  hand,
  perspective = "iso",
  children,
}: {
  hand: IsoHand;
  perspective?: IsoPerspective;
  children: ReactNode;
}) {
  return (
    <IsoCameraContext.Provider value={{ hand, perspective }}>{children}</IsoCameraContext.Provider>
  );
}

export function useIsoHand(): IsoHand {
  return useContext(IsoCameraContext).hand;
}

export function useIsoPerspective(): IsoPerspective {
  return useContext(IsoCameraContext).perspective;
}

/** Build path geometry under the ambient scene hand + perspective. */
export function useProjected<T>(build: () => T): T {
  const { hand, perspective } = useContext(IsoCameraContext);
  return withIsoHand(hand, () => withIsoPerspective(perspective, build));
}
