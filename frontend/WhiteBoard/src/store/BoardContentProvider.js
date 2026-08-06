import { useCallback, useReducer, useEffect} from "react"
import BoardContext from "./board-context"
import { BOARD_OPTIONS, TOOL_ACTIONS, TOOL_ITEMS } from "../constant"
import { createElements, getSvgPathFromStroke, ispointerNear } from "../utility/elements";
import getStroke from "perfect-freehand";
import { socket } from "../socket";

const dispatch = (state,action) => {
  switch (action.type) {

// Replace your existing LOAD_SESSION case with this:

    case BOARD_OPTIONS.LOAD_SESSION: {
      const incomingElements = action.payload.elements || [];
      const loadedElements = incomingElements.map((element) => {
        // If the element is a brush, we must reconstruct the Path2D object from the raw points
        if (element.type === TOOL_ITEMS.BRUSH) {
          return {
            ...element,
            path: new Path2D(getSvgPathFromStroke(getStroke(element.points)))
          };
        }
        return element;
      });

      return {
        ...state,
        elements: loadedElements,
        history: [loadedElements], 
        index: 0,
      };
    }

    case BOARD_OPTIONS.CHANGE_TOOLACTION_TYPE:
      return {
        ...state,
        ToolActionType : action.payload.actionType,
      };

    case BOARD_OPTIONS.Change_Tool:
      return{
        ...state,
        activeToolItem : action.payload.tool
      };      
    
    case BOARD_OPTIONS.Draw_DOWN:{
      const prevElement = state.elements;
      const {clientX,clientY,fill,Size,StrokeColor} = action.payload;
      const newElement = createElements(state.elements.length,clientX,clientY,clientX,clientY,{type : state.activeToolItem,Size,fill,StrokeColor});
      return{
        ...state,
        ToolActionType : (state.activeToolItem === TOOL_ITEMS.TEXT)?TOOL_ACTIONS.WRITING:TOOL_ACTIONS.DRAWING, 
        elements : [...prevElement,newElement]
      }
    }

    case BOARD_OPTIONS.Draw_MOVE: {
              const {clientX,clientY,fill,Size,StrokeColor} = action.payload;
              const copyElement = [...state.elements];
              const index = state.elements.length - 1;
              const {type} = copyElement[index];

              switch (type) {
              
                case TOOL_ITEMS.LINE:
                case TOOL_ITEMS.RECTANGLE:
                case TOOL_ITEMS.CIRCLE:
                case TOOL_ITEMS.ARROW:
                  const {x1,y1} = copyElement[index];
                  const newElement = createElements(index,x1,y1,clientX,clientY,{type:state.activeToolItem,Size,fill,StrokeColor});
                  copyElement[index] = newElement;
                  return{
                    ...state,
                    elements : copyElement,
                  }
                
                case TOOL_ITEMS.BRUSH:{
                  copyElement[index].points = [...copyElement[index].points,{x:clientX,y:clientY}];
                  copyElement[index].path = new Path2D(getSvgPathFromStroke(getStroke(copyElement[index].points)));
                  return{
                    ...state,
                    elements : copyElement,
                  }
                }
              
                default:
                  throw new Error("TYPE not recognized");
              }
            
    }

    case BOARD_OPTIONS.Draw_UP:{
      const newElement = [...state.elements];
      const newHistory = state.history.slice(0,state.index+1); // since we want to break the sequence of redo if we first undo and then change something
      newHistory.push(newElement);
      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      }
    }

    case BOARD_OPTIONS.ERASE:{
      const {clientX , clientY} = action.payload;
      let newElements = [...state.elements];
      newElements = newElements.filter((element) => {
        return !ispointerNear(element,clientX,clientY);
      })
      return{
        ...state,
        elements : newElements,
      }
    }

    case BOARD_OPTIONS.CHANGE_TEXT:{
      const index = state.elements.length - 1;
      const newElements = [...state.elements];
      newElements[index].text = action.payload.text;

      const newHistory = state.history.slice(0,state.index+1);
      newHistory.push(newElements);

      return{
        ...state,
        ToolActionType : TOOL_ACTIONS.NONE,
        elements : newElements,
        history: newHistory,
        index: state.index+1,
      }
    }

    case BOARD_OPTIONS.UNDO:{
      if(state.index <= 0) return state;
      return{
        ...state,
        elements : state.history[state.index-1],
        index : state.index-1,
      }
    }

    case BOARD_OPTIONS.REDO:{
      if(state.index >= state.history.length-1) return state;
      return{
        ...state,
        elements : state.history[state.index+1],
        index : state.index+1,
      }
    }

    default:
      return state;
  }
}

const initialState = {
  activeToolItem : TOOL_ITEMS.BRUSH,
  ToolActionType : TOOL_ACTIONS.NONE,
  elements : [],
  index:0,
  history:[[]],
}

const BoardContentProvider = ({children, currentSessionId}) => {
    const [boardState , DispatchEvent] = useReducer(dispatch, initialState);

    console.log("Session ID in Provider:", currentSessionId);
    useEffect(() => {
      // Prevent emitting empty arrays on initial load unless required
      if (boardState.elements.length === 0 && boardState.index === 0) return;
      // Ensure we have a valid session ID before emitting
      if (currentSessionId) {
          socket.emit('draw', { 
              sessionId: currentSessionId, 
              elements: boardState.elements 
          });
      }
    }, [boardState.index]);

    const ChangeToolHandler = (tool) =>{
      DispatchEvent({
        type : BOARD_OPTIONS.Change_Tool,
        payload : {
          tool 
        }
      });
    }

    const MouseDownHandler = (event,toolBoxState) => {
      if(boardState.ToolActionType === TOOL_ACTIONS.WRITING) return;

      if(boardState.activeToolItem === TOOL_ITEMS.ERASER){
        DispatchEvent({
          type: BOARD_OPTIONS.CHANGE_TOOLACTION_TYPE,
          payload:{
            actionType : TOOL_ACTIONS.ERASING,
          }
        })
        return;
      }
      else{
      const {clientX,clientY} = event;

        DispatchEvent({
        type: BOARD_OPTIONS.Draw_DOWN,
        payload : {
            clientX,
            clientY,
            fill : toolBoxState[boardState.activeToolItem]?.fill,
            StrokeColor : toolBoxState[boardState.activeToolItem]?.stroke,
            Size : toolBoxState[boardState.activeToolItem]?.size,
          }
        })
      }
    }

    const MouseMoveHandler = (event,toolBoxState) => {
      if(boardState.ToolActionType === TOOL_ACTIONS.WRITING) return;

      const {clientX,clientY} = event;

      if(boardState.activeToolItem === TOOL_ITEMS.ERASER && boardState.ToolActionType === TOOL_ACTIONS.ERASING){
        DispatchEvent({
          type: BOARD_OPTIONS.ERASE,
          payload: {
            clientX,
            clientY,
          }
        })
      }
      else if(boardState.ToolActionType === TOOL_ACTIONS.DRAWING){
        DispatchEvent({
          type: BOARD_OPTIONS.Draw_MOVE,
          payload : {
            clientX,
            clientY,
            fill: toolBoxState[boardState.activeToolItem]?.fill,
            StrokeColor: toolBoxState[boardState.activeToolItem]?.stroke,
            Size: toolBoxState[boardState.activeToolItem]?.size,
          }
        })
      }
    }

    const MouseUpHandler = () => {
      if(boardState.ToolActionType === TOOL_ACTIONS.WRITING) return;
      if(boardState.ToolActionType === TOOL_ACTIONS.DRAWING || boardState.ToolActionType === TOOL_ACTIONS.ERASING ){
        DispatchEvent({
          type: BOARD_OPTIONS.Draw_UP,
        })
      }

      DispatchEvent({
        type: BOARD_OPTIONS.CHANGE_TOOLACTION_TYPE,
        payload : {
          actionType : TOOL_ACTIONS.NONE,
        }
      })
    }

    //useCallback because in board.indiex.js it is called in sideEffect
    const boardUNDOHandler = useCallback(() => {
      DispatchEvent({
        type: BOARD_OPTIONS.UNDO,
      })
    })

    const boardREDOHandler = useCallback(() => {
      DispatchEvent({
        type: BOARD_OPTIONS.REDO,
      })
    })

    const textBlurHandler = (text) => {
      DispatchEvent({
        type:BOARD_OPTIONS.CHANGE_TEXT,
        payload:{
          text
        }
      })
    }

    const loadSessionData = (elements) => {
      DispatchEvent({
        type: BOARD_OPTIONS.LOAD_SESSION,
        payload: { elements }
      });
    };

    const BoardContextValues = {
        activeToolItem : boardState.activeToolItem,
        ToolActionType : boardState.ToolActionType,
        elements : boardState.elements,
        ChangeToolHandler,
        MouseDownHandler,
        MouseMoveHandler,
        MouseUpHandler,
        undo : boardUNDOHandler,
        redo : boardREDOHandler,
        textBlurHandler,
        loadSessionData,
    }
  return (
    <BoardContext.Provider value={BoardContextValues}>
        {children}
    </BoardContext.Provider>
  )
}

export default BoardContentProvider