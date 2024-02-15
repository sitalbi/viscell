import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * Barplot component
 * 
 * @param {*} x
 * @param {*} y
 * @param {*} width
 * @param {*} height
 * @returns {JSX.Element}
 */
const Barplot = ({ x, y, width, height }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Example data for the barplot
    const data = [20, 30, 40, 50, 60];

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height, 0]);

    // Create and append <g> tag
    const g = svg.append("g");

    // Draw bars
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (width / data.length))
      .attr("y", d => yScale(d))
      .attr("width", width / data.length - 2)
      .attr("height", d => height - yScale(d))
      .attr("fill", "steelblue")
  }, [x, y, width, height]);

  // Declare style for the barplot
  const barplotStyle = {
    border: "1px solid #d3d3d3",
    borderRadius: "5px",
  };

  return <svg ref={svgRef} width={width} height={height} style={barplotStyle} />;
};

export default Barplot;