import { createContext } from "react";

const ToolBoxContext = createContext({
  toolBoxState: {},
  changeStroke: () => {},
  changeFill: () => {},
  changeSize: () => {},
});

export default ToolBoxContext;