import { createContext } from "react";
import { TOOL_ACTIONS, TOOL_ITEMS } from "../constant";

const BoardContext = createContext( {
    activeToolItem : TOOL_ITEMS.LINE,
    ToolActionType : TOOL_ACTIONS.NONE,
    history : [[]],
    index : 0,
    ChangeToolHandler : () => {},
    MouseDownHandler : () => {},
    MouseUpHandler : () => {},
    MouseMoveHandler : () => {},
    textBlurHandler: () => {},
    boardUNDOHandler: () => {},
    boardREDOHandler: () => {},
    elements: [],
    loadSessionData: () => {},
});

export default BoardContext;