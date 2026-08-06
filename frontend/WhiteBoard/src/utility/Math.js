import { MinDist } from "../constant";

export const ArrowMaker = (x1,y1,x2,y2,arrowLen) => {
 
    const theta = Math.atan2((y2-y1),(x2-x1));

    const x3 = x2 - arrowLen * Math.cos(theta - Math.PI/6); 
    const y3 = y2 - arrowLen * Math.sin(theta - Math.PI/6);

    const x4 = x2 - arrowLen * Math.cos(theta + Math.PI/6); 
    const y4 = y2 - arrowLen * Math.sin(theta + Math.PI/6); 

    return {
        x3,y3,x4,y4
    }
}

export const getDist = (x1,y1,x2,y2) => {
    const y = (y2-y1); 
    const x = (x2-x1); 
    return Math.sqrt(y*y + x*x);
}

export const isPointOnLine = (x1,y1,x2,y2,PointX,PointY) => {
    const d1 = getDist(x1,y1,PointX,PointY);
    const d2 = getDist(x2,y2,PointX,PointY);
    const d3 = getDist(x1,y1,x2,y2);
    return Math.abs(d1+d2-d3) <= MinDist.LINE;
}