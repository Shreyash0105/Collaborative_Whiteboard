import { useContext } from "react"
import classes from "./ToolBox.module.css"
import { COLORS, FILL_TOOL_ITEMS, SIZE_TOOL_ITEMS, STROKE_TOOL_ITEMS, TOOL_ITEMS } from "../../constant";
import cx from "classnames"
import BoardContext from "../../store/board-context";
import ToolBoxContext from "../../store/toolboxContext";

const ToolBox = () => {
    const {activeToolItem} = useContext(BoardContext);
    const {toolBoxState,changeStroke,changeFill,changeSize} = useContext(ToolBoxContext);
    const strokeColor = toolBoxState[activeToolItem]?.stroke;
    const fillColor = toolBoxState[activeToolItem]?.fill;
    const Size = toolBoxState[activeToolItem]?.size;
    
  return (
    <div className={classes.container}>

        {STROKE_TOOL_ITEMS.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
            <div className={classes.toolBoxLabel}>Stroke Color</div>
            <div className={classes.colorsContainer}>
              <div>
                  <input
                    className={classes.colorPicker}
                    type="color"
                    value={strokeColor}
                    onChange={(e) => changeStroke(activeToolItem, e.target.value)}
                  ></input>
              </div>
              {Object.keys(COLORS).map((k) => {
              return (
                <div
                  key={k}
                  className={cx(classes.colorBox, {
                    [classes.activeColorBox]: strokeColor === COLORS[k],
                  })}
                  style={{ backgroundColor: COLORS[k] }}
                  onClick={() => changeStroke(activeToolItem,COLORS[k])}
                ></div>
              );
            })}
            </div>
        </div>}

        {FILL_TOOL_ITEMS.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
            <div className={classes.toolBoxLabel}>Fill Color</div>
            <div className={classes.colorsContainer}>
              {fillColor === null ? (
                <div
                  className={cx(classes.colorPicker, classes.noFillColorBox)}
                  onClick={() => changeFill(activeToolItem, COLORS.BLACK)}
                ></div>
              ) : (
                <div>
                  <input
                    className={classes.colorPicker}
                    type="color"
                    value={fillColor}
                    onChange={(e) => changeFill(activeToolItem, e.target.value)}
                  ></input>
                </div>
              )}


              <div
              className={cx(classes.colorBox, classes.noFillColorBox, {
                [classes.activeColorBox]: fillColor === null,
              })}
              onClick={() => changeFill(activeToolItem, null)}
            ></div>


              {Object.keys(COLORS).map((k) => {
              return (
                <div
                  key={k}
                  className={cx(classes.colorBox, {
                    [classes.activeColorBox]: fillColor === COLORS[k],
                  })}
                  style={{ backgroundColor: COLORS[k] }}
                  onClick={() => changeFill(activeToolItem,COLORS[k])}
                ></div>
              );
            })}
            </div>
        </div>}

        {SIZE_TOOL_ITEMS.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
            <div className={classes.toolBoxLabel}>
              {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
            </div>
            <input 
            type="range"
            min={(activeToolItem === TOOL_ITEMS.TEXT)?16:1}
            max={(activeToolItem === TOOL_ITEMS.TEXT)?64:10}
            value={Size}
            onChange={(event)=>changeSize(activeToolItem,event.target.value)}
            />
        </div>}
    </div>
  )
}

export default ToolBox