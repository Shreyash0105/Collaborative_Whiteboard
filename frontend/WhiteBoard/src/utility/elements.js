import rough from "roughjs"
import { ArrowLength, TOOL_ITEMS } from "../constant";
import { ArrowMaker,isPointOnLine} from "./Math";
import getStroke from "perfect-freehand";

const gen = rough.generator();

export const createElements = (id,x1,y1,x2,y2,{type,Size,fill,StrokeColor}) => {
    const Element = {
        id,
        x1,
        y1,
        x2,
        y2,
        type, // very important
    }
    let options = {//to make it smooth while drawing
        seed: id+1, //since id can't be zero
        fillStyle:'solid'
    }

    if(fill){
        options.fill = fill;
    }
    if(StrokeColor){
        options.stroke = StrokeColor;
    }
    if(Size){
        options.strokeWidth = Size;
    }
    switch(type){
        case TOOL_ITEMS.BRUSH : {
            const BrushElement = {
                id,
                points : [{x :x1 , y:y1}],
                path : new Path2D(getSvgPathFromStroke(getStroke([{x:x1,y:y1}]))),
                type,
                StrokeColor,
            }
            return BrushElement;
        }

        case TOOL_ITEMS.LINE :{
            Element.roughEle = gen.line(x1,y1,x2,y2,options);
            return Element;
        }

        case TOOL_ITEMS.RECTANGLE :{
            Element.roughEle = gen.rectangle(x1,y1,x2-x1,y2-y1,options);
            return Element;
        }

        case TOOL_ITEMS.CIRCLE :{
            const cx = (x1+x2)/2, cy = (y1+y2)/2;
            const width = x2-x1, height = y2-y1;
            Element.roughEle = gen.ellipse(cx,cy,width,height,options);
            return Element;
        }

        case TOOL_ITEMS.ARROW :{
            const {x3,y3,x4,y4} = ArrowMaker(x1,y1,x2,y2,ArrowLength);
            const points = [
                [x1,y1],
                [x2,y2],
                [x3,y3],
                [x2,y2],
                [x4,y4]
            ]

            Element.roughEle = gen.linearPath(points,options);
            return Element;
        }

        case TOOL_ITEMS.TEXT:{
            Element.text = "";
            Element.stroke = StrokeColor; 
            Element.size = Size;
            return Element;
        }

        default : 
            console.log(type);
            throw new Error ("Type Not Recognized");
            // return undefined;
    }   
};




//FOR BRUSH ELEMENT
// Turn the points returned from perfect-freehand into SVG path data.

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ""

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ["M", ...stroke[0], "Q"]
  )

  d.push("Z")
  return d.join(" ")
}


// For Eraser Element
export const ispointerNear = (element,pointX,pointY) => {
    const {x1,y1,x2,y2,type} = element;
    switch (type) {

        //for Line/Arrow -> check if d1+d2-dreal==0 implies that the point is on the line
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.ARROW:
            return isPointOnLine(x1,y1,x2,y2,pointX,pointY);
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
            return isPointOnLine(x1,y1,x1,y2,pointX,pointY)||isPointOnLine(x1,y1,x2,y1,pointX,pointY)||isPointOnLine(x2,y1,x2,y2,pointX,pointY)||isPointOnLine(x1,y2,x2,y2,pointX,pointY);
        
        case TOOL_ITEMS.BRUSH:{
            const context = document.getElementById("canvas").getContext("2d");
            return context.isPointInPath(element.path, pointX, pointY);
        }

        case TOOL_ITEMS.TEXT:{
            const context = document.getElementById("canvas").getContext("2d");
            context.font = `${element.size}px Caveat Brush`;
            context.fillStyle = element.stroke;
            const textWidth = context.measureText(element.text).width;
            const textHeight = parseInt(element.size);
            context.restore();

            return (
                isPointOnLine(x1, y1, x1 + textWidth, y1, pointX, pointY) ||
                isPointOnLine(
                  x1 + textWidth,
                  y1,
                  x1 + textWidth,
                  y1 + textHeight,
                  pointX,
                  pointY
                ) ||
                isPointOnLine(
                  x1 + textWidth,
                  y1 + textHeight,
                  x1,
                  y1 + textHeight,
                  pointX,
                  pointY
                ) ||
                isPointOnLine(x1, y1 + textHeight, x1, y1, pointX, pointY)
            )
        }
        default:
            throw new Error('Tool item not recognized whil measuring eraser point distance');
    }

}