import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const Barplot = ({ width, height }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Example data for the barplot
    const data = [20, 30, 40, 50, 60];

    // Calculate scaling factor
    const originalWidth = 150; // default width of the barplot
    const originalHeight = 80; // default height of the barplot
    const scaleFactor = Math.min(width / originalWidth, height / originalHeight);

    // Scaled dimensions
    const scaledWidth = originalWidth * scaleFactor;
    const scaledHeight = originalHeight * scaleFactor;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([scaledHeight, 0]);

    // Create and append <g> tag
    const g = svg.append("g").attr("transform", `translate(${(width - scaledWidth) / 2}, ${(height - scaledHeight) / 2})`); // Adjust positioning to center the barplot within the node

    // Draw bars
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (scaledWidth / data.length))
      .attr("y", d => yScale(d))
      .attr("width", (scaledWidth / data.length - 2))
      .attr("height", d => scaledHeight - yScale(d))
      .attr("fill", "steelblue");
  }, [width, height]);

  // Declare style for the barplot
  const barplotStyle = {
    border: "1px solid #d3d3d3",
    borderRadius: "5px"
  };

  return <svg className="barplot" ref={svgRef} width={width} height={height} style={barplotStyle} />;
};

export default Barplot;