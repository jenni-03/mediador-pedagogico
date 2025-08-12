// types
export type TourStep = {
  id?: string;
  description?: string;
  type: "element" | "info" | "action" | "write" | "enter";
  text?: string;
};
