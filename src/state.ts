import { deck } from "./content";
export type Stage = "question" | "answer" | "explanation";
export interface PresentationState {
  index: number;
  stage: Stage;
  selected: number | null;
  step: number;
}
export type Action =
  | { type: "navigate"; index: number }
  | { type: "select"; option: number }
  | { type: "reveal" }
  | { type: "explain" }
  | { type: "hide" }
  | { type: "step"; step: number }
  | { type: "reset" };
export const initialState: PresentationState = {
  index: 0,
  stage: "question",
  selected: null,
  step: 0,
};
export function presentationReducer(
  s: PresentationState,
  a: Action,
): PresentationState {
  switch (a.type) {
    case "navigate":
      return {
        ...initialState,
        index: Math.max(0, Math.min(deck.length - 1, a.index)),
      };
    case "select":
      return s.stage === "question"
        ? { ...s, selected: s.selected === a.option ? null : a.option }
        : s;
    case "reveal":
      return deck[s.index].kind === "question" && s.stage === "question"
        ? { ...s, stage: "answer" }
        : s;
    case "explain":
      return s.stage === "answer" ? { ...s, stage: "explanation", step: 0 } : s;
    case "hide":
      return { ...s, stage: "question", step: 0 };
    case "step":
      return s.stage === "explanation" ? { ...s, step: a.step } : s;
    case "reset":
      return initialState;
  }
}
