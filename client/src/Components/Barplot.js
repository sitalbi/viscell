import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const BarplotNode = ({ x, y, width, height }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Example data for the barplot
    const data = [20, 30, 40, 50, 60];

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height, 0]);
    
    // Draw bars
    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (width / data.length))
      .attr("y", d => yScale(d))
      .attr("width", width / data.length - 2)
      .attr("height", d => height - yScale(d))
      .attr("fill", "steelblue");
  }, [x,y,width, height]);

  return <svg ref={svgRef} width={width} height={height}>
    <g transform={`translate(${x}, ${y})`} />
  </svg>;
};

export default BarplotNode;
