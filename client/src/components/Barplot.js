import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const Barplot = ({ width, height, importedData }) => {
  const svgRef = useRef();
  const cellsMap = new Map();
  const [cellsMapSize, setCellsMapSize] = useState(0);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Calculate scaling factor
    const originalWidth = 150; // default width of the barplot
    const originalHeight = 80; // default height of the barplot

    for (let value of importedData.values()) {
      const genesMap = new Map();
      for (const [key, gene] of Object.entries(value)) {
        if (key !== "") {
          if (gene !== "0") {
            genesMap.set(key, gene);
          }
        }
      }
      cellsMap.set(value[""], new Map([...genesMap.entries()].slice(0, 5)));
    }

    let i = 0;
    cellsMap.forEach(function (value, key, map) {
      //Ignore First cell 
      if (key !== "C") {

        const data = [];
        const labels = [];

        for (let [gene, v] of value.entries()) {
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
          .attr("y", d => yScale(d) + (height * i))
          .attr("width", (scaledWidth / data.length - 4)) // Augmenter l'écart entre les colonnes
          .attr("height", d => scaledHeight - yScale(d))
          .attr("fill", "steelblue");


        // Add legend text
        g.selectAll("text")
          .data(labels)
          .enter()
          .append("text")
          .text(d => d)
          .attr("x", (d, i) => i * (scaledWidth / labels.length) + (scaledWidth / labels.length - 5) / 2) // Ajuster la position en X
          .attr("y", scaledHeight + 30 + (height * i)) // Ajuster la position en Y
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "black");

        // Add title
        g.append("text")
          .text(`Title : ${key}`)
          .attr("x", scaledWidth / 2)
          .attr("y", -10 + (height * i))
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", "black");
        i++;
      }
    });
  }, [width, height, importedData, cellsMapSize, cellsMap]);

  // Update the size of the cellsMap 
  useEffect(() => {
    setCellsMapSize(cellsMap.size);
  }, [cellsMap]);

  // Declare style for the barplot
  const barplotStyle = {
    border: "1px solid #d3d3d3",
    borderRadius: "5px"
  };

  return (
    <div>
      <svg className="barplot" ref={svgRef} width={width} height={height * cellsMapSize - 1} style={barplotStyle} />
    </div>
  );
};