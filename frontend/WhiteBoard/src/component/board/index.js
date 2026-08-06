import { useContext, useEffect, useLayoutEffect } from 'react'
import { useRef } from 'react'
// import { RoughCanvas } from 'roughjs/bin/canvas'
import rough from "roughjs"
import BoardContext from '../../store/board-context'
import { TOOL_ACTIONS, TOOL_ITEMS } from '../../constant'
import ToolBoxContext from '../../store/toolboxContext'
import classes from "./index.module.css"

const Board = () => {
    const {elements,ToolActionType,textBlurHandler,MouseDownHandler,MouseMoveHandler,MouseUpHandler,undo,redo} = useContext(BoardContext)
    const {toolBoxState} = useContext(ToolBoxContext)
    
        useEffect(()=>{
      function handleKeyDown(event){
            if (event.ctrlKey && event.key === "z") {
              undo();
            } else if (event.ctrlKey && event.key === "y") {
              redo();
            }
      }

      document.addEventListener("keydown",handleKeyDown);
      return () => {
        document.removeEventListener("keydown",handleKeyDown);
      }
    },[undo,redo]);
    
    const canvasref = useRef();
    const textref = useRef();

    useLayoutEffect(()=>{
        const canvas = canvasref.current;
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    },[])

    useEffect(()=>{
      const textportion = textref.current
      if(ToolActionType === TOOL_ACTIONS.WRITING){
        setTimeout(()=>{
          textportion.focus()
        },0)
      }
    },[ToolActionType])

    useLayoutEffect(() => {
      const canvas = canvasref.current;
      const context = canvas.getContext("2d");
      context.save();

      const roughcanva = rough.canvas(canvas);

      elements.forEach(element => {
        switch (element.type) {
          case TOOL_ITEMS.LINE:
          case TOOL_ITEMS.RECTANGLE:
          case TOOL_ITEMS.CIRCLE:
          case TOOL_ITEMS.ARROW:{
            roughcanva.draw(element.roughEle);
            break;
          }
          case TOOL_ITEMS.BRUSH:{
            context.fillStyle = element.StrokeColor;
            context.fill(element.path);
            context.restore();
            break;
          }
          case TOOL_ITEMS.TEXT:{
            context.textBaseline = "top";
            context.font = `${element.size}px Caveat Brush`;
            context.fillStyle = element.stroke;
            context.fillText(element.text, element.x1, element.y1);
            context.restore();
            break;
          }
          default:
            console.log("Unknown element type:", element.type, element); 
            throw new Error(`Type not recognized: ${element.type}`);
        }
    });


      return () => {
        context.clearRect(0,0,canvas.width,canvas.height);
      }
      
    },[elements])

  const handleMouseDown = (event) =>{
    MouseDownHandler(event,toolBoxState);
  }

  const handleMouseMove = (event) =>{
    // if(ToolActionType === TOOL_ACTIONS.DRAWING){
      MouseMoveHandler(event,toolBoxState);
    // }
  }

  const handleMouseUp = () => {
    MouseUpHandler();
  }

  return (
    <>
    {ToolActionType === TOOL_ACTIONS.WRITING && (<textarea 
        type='text'
        id='textcanvas'
        className={classes.textElementBox} 
        ref={textref}
        style={{
              top: elements[elements.length - 1].y1,
              left: elements[elements.length - 1].x1,
              fontSize: `${elements[elements.length - 1]?.size}px`,
              color: elements[elements.length - 1]?.stroke,
        }}
        onBlur={(event)=>{textBlurHandler(event.target.value)}}
      />
    )}
    <canvas id='canvas' ref={canvasref} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}/>
    </>
  )
}

export default Board