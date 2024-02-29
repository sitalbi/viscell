import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * Barplot component
 * 
 * @param {*} width The width of the barplot
 * @param {*} height The height of the barplot
 * @param {*} cellName The name of the cell
 * @param {*} genes  The map of genes
 * 
 * @returns {JSX.Element}
 */
const Barplot = ({ width, height, cellName, genes }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Calculate scaling factor
    const originalWidth = 130; // default width of the barplot
    const originalHeight = 80; // default height of the barplot

    // Ignore First cell 
    if (cellName !== "C") {
      const data = [];
      const labels = [];

      for (let [gene, v] of genes.entries()) {
        data.push(v);
        labels.push(gene);
      }

      const scaleFactor = Math.min(width / originalWidth, height / originalHeight);

      // Scaled dimensions
      const scaledWidth = originalWidth * scaleFactor;
      const scaledHeight = originalHeight * scaleFactor;

      // Scale for mapping data values to pixel values
      const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([scaledHeight, 0]);

      // Create and append <g> tag
      // Adjust positioning to center the barplot within the node
      const g = svg.append("g").attr("transform", `translate(${(width - scaledWidth) / 2}, ${(height - scaledHeight) / 2})`);

      // Draw bars
      g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * (scaledWidth / data.length))
        .attr("y", d => yScale(d))
        .attr("width", (scaledWidth / data.length - 4)) // Augmenter l'écart entre les colonnes
        .attr("height", d => scaledHeight - yScale(d))
        .attr("fill", "steelblue");


      // Add legend text
      g.selectAll("text")
        .data(labels)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", (d, i) => i * (scaledWidth / labels.length) + (scaledWidth / labels.length - 10) / 2) // Ajuster la position en X
        .attr("y", scaledHeight) // Ajuster la position en Y
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "black");

      // Add title
      g.append("text")
        .text(`Title : ${cellName}`)
        .attr("x", scaledWidth / 2)
        .attr("y", scaledHeight / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "black");
    }

  }, [width, height, cellName, genes]);

  // Declare style for the barplot
  const barplotStyle = {
    border: "1px solid #d3d3d3",
    borderRadius: "5px"
  };

  return (
    <div>
      <svg className="barplot" ref={svgRef} width={width} height={height + 30} style={barplotStyle} />
    </div>
  );
};

export default Barplot;