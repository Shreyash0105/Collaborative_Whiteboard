import { useReducer } from 'react';
import ToolBoxContext from './toolboxContext'
import { COLORS, TOOL_ITEMS } from '../constant';

function toolBoxReducer (state,action) {
    switch (action.type) {
        case "CHANGE_STROKE":{
            const newState = {...state};
            newState[action.payload.tool].stroke = action.payload.stroke;
            return newState;
        }

        case "CHANGE_FILL":{
            const newState = {...state};
            newState[action.payload.tool].fill = action.payload.fill;
            return newState;
        }
    
        case "CHANGE_Size":{
            const newState = {...state};
            newState[action.payload.tool].size = action.payload.Size;
            return newState;
        }

        default:
            return state;
    }
}

const intialToolBoxState = {
    [TOOL_ITEMS.BRUSH]:{
        stroke : COLORS.BLACK,
    },    
    [TOOL_ITEMS.LINE]:{
        stroke : COLORS.BLACK,
        size : 1,
    },
    [TOOL_ITEMS.RECTANGLE]:{
        stroke : COLORS.BLACK,
        fill : null,
        size : 1,
    },
    [TOOL_ITEMS.CIRCLE]:{
        stroke : COLORS.BLACK,
        fill : null,
        size : 1,
    },
    [TOOL_ITEMS.ARROW]:{
        stroke : COLORS.BLACK,
        size : 1,
    },
    [TOOL_ITEMS.TEXT]:{
        stroke : COLORS.BLACK,
        size : 16,
    },
};

const ToolBoxProvider = ({children}) => {

    const [toolBoxState , dispatchToolBoxActions] = useReducer(toolBoxReducer,intialToolBoxState);

    const changeStrokeHandler = (tool,stroke) =>{
        dispatchToolBoxActions({
            type : "CHANGE_STROKE",
            payload : {
                tool,
                stroke,
            }
        })
    }

    const changeFillHandler = (tool,fill) =>{
        dispatchToolBoxActions({
            type : "CHANGE_FILL",
            payload : {
                tool,
                fill,
            }
        })
    }

    const changeSizeHandler = (tool,Size) =>{
        dispatchToolBoxActions({
            type : "CHANGE_Size",
            payload : {
                tool,
                Size,
            }
        })
    }

    const ToolBoxStateValues = {
        toolBoxState,
        changeStroke : changeStrokeHandler,
        changeFill : changeFillHandler,
        changeSize : changeSizeHandler,
    }

  return (
    <ToolBoxContext.Provider value={ToolBoxStateValues}>
        {children}
    </ToolBoxContext.Provider>
)
}

export default ToolBoxProvider