export const TOOL_ITEMS = {
  BRUSH: "BRUSH",
  LINE: "LINE",
  RECTANGLE: "RECTANGLE",
  CIRCLE: "CIRCLE",
  ARROW: "ARROW",
  ERASER: "ERASER",
  TEXT: "TEXT",
};

export const BOARD_OPTIONS = {
  Change_Tool : "Change_Tool",
  Draw_UP : "Draw_UP",
  Draw_DOWN : "Draw_DOWN",
  Draw_MOVE : "Draw_MOVE",
  ERASE : "ERASE",
  CHANGE_TOOLACTION_TYPE : "CHANGE_TOOLACTION_TYPE",
  CHANGE_TEXT : "CHANGE_TEXT",
  UNDO: "UNDO",
  REDO: "REDO",
  LOAD_SESSION: "LOAD_SESSION",
};

export const TOOL_ACTIONS = {
  NONE : "NONE",
  DRAWING : "DRAWING",
  ERASING : "ERASING",
  WRITING : "WRITING"
}


export const COLORS = {
  BLACK: "#000000",
  RED: "#ff0000",
  GREEN: "#00ff00",
  BLUE: "#0000ff",
  ORANGE: "#ffa500",
  YELLOW: "#ffff00",
  WHITE: "#ffffff",
};

export const STROKE_TOOL_ITEMS = [
  TOOL_ITEMS.LINE,
  TOOL_ITEMS.RECTANGLE,
  TOOL_ITEMS.ARROW,
  TOOL_ITEMS.BRUSH,
  TOOL_ITEMS.CIRCLE,
  TOOL_ITEMS.TEXT,
]

export const FILL_TOOL_ITEMS = [
  TOOL_ITEMS.RECTANGLE,
  TOOL_ITEMS.CIRCLE,
]

export const SIZE_TOOL_ITEMS = [
  TOOL_ITEMS.LINE,
  TOOL_ITEMS.RECTANGLE,
  TOOL_ITEMS.CIRCLE,
  TOOL_ITEMS.ARROW,
  TOOL_ITEMS.TEXT,
]

export const ArrowLength = 20;

export const MinDist = {
  LINE : 0.1
}