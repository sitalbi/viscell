import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const Barplot = ({ width, height, cellName, genes }) => {
  const svgRef = useRef();
  const popupSvgRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [popupGenes, setPopupGenes] = useState([]);
  const [clickedTitle, setClickedTitle] = useState(false);

  const renderBarplot = useCallback((data, svgReference, drawFunction) => {
    const svg = d3.select(svgReference.current);
    svg.selectAll("*").remove();

    // Calculate scaling factor
    const originalWidth = 130; // default width of the barplot
    const originalHeight = 80; // default height of the barplot

    // Ignore First cell
    if (cellName !== "C") {
      drawFunction(data, originalWidth, originalHeight, svg);
    }
  }, [cellName]);

  // Draw Sliced Barplot
  const drawBarplotSliced = useCallback((data, originalWidth, originalHeight, svg) => {
    const labels = Array.from(data).map(([gene]) => gene);
    const scaleFactor = Math.min(width / originalWidth, height / originalHeight);

    // Scaled dimensions
    const scaledWidth = originalWidth * scaleFactor;
    const scaledHeight = originalHeight * scaleFactor;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data.map(([, v]) => v))]).range([scaledHeight, 0]);

    // Create and append <g> tag
    // Adjust positioning to center the barplot within the node
    const g = svg.append("g").attr("transform", `translate(${(width - scaledWidth) / 2}, ${(height - scaledHeight) / 2})`);

    const space = 5; // Space between bars

    // Draw bars
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_d, i) => i * (scaledWidth / data.length))
      .attr("y", ([, v]) => yScale(v))
      .attr("width", (scaledWidth / data.length - space))
      .attr("height", ([, v]) => scaledHeight - yScale(v))
      .attr("data-testid", "bar-rectangle")
      .attr("fill", "steelblue");

    // Add legend text
    g.selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", (_d, i) => i * (scaledWidth / labels.length) + (scaledWidth / labels.length) / 2)
      .attr("y", scaledHeight)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "black");

    // Add title
    g.append("text")
      .text(`${cellName}`)
      .attr("x", scaledWidth / 2)
      .attr("y", scaledHeight / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .style("cursor", "pointer")
      .on("click", () => {
        setPopupGenes(Array.from(genes.entries()));
        setShowModal(true);
        setClickedTitle(true);
      });
  }, [width, height, cellName, genes]);

  // Draw Full Barplot on click
  function drawBarplotFull(data, _originalWidth, originalHeight, svg) {
    const labels = Array.from(data).map(([gene]) => gene);
    const totalBarplots = popupGenes.length;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data.map(([, v]) => v))]).range([originalHeight, 0]);

    // Calculate bar width and spacing to fit within the SVG width
    // Each bar takes an equal portion of the SVG width minus the space for spacing
    const barWidth = (calculateSvgWidth() - (totalBarplots - 1) * 5) / totalBarplots;
    const barSpacing = 5; // Spacing between bars

    // Draw bars
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_d, i) => i * (barWidth + barSpacing))
      .attr("y", ([, v]) => yScale(v))
      .attr("width", barWidth)
      .attr("height", ([, v]) => originalHeight - yScale(v) + 40)
      .attr("data-testid", "bar-rectangle")
      .attr("fill", "steelblue");

    // Add legend text
    svg.selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", (_d, i) => i * (barWidth + barSpacing) + barWidth / 2) // Center text over bars
      .attr("y", originalHeight + 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "black");
  }

  useEffect(() => {
    // Only call drawBarplotSliced if clickedTitle is false
    if (!clickedTitle) {
      const dataToRender = Array.from(genes.entries()).slice(0, 3);
      renderBarplot(dataToRender, svgRef, drawBarplotSliced);
    }
  }, [width, height, cellName, genes, clickedTitle, renderBarplot, drawBarplotSliced]);

  const calculateSvgWidth = () => {
    const rectangleWidth = 50;
    const spacing = 10;
    const totalWidth = (rectangleWidth + spacing) * popupGenes.length;
    return totalWidth;
  };

  // Declare style for the barplot
  const barplotStyle = {
    border: "1px solid #d3d3d3",
    borderRadius: "5px",
  };

  // Define custom styles for the popup content
  const popupStyle = {
    width: '100%%',
    height: '50%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    background: '#fff',
    overflow: 'auto',
  };

  const popupContent = (
    <div>
      <h2>Full Barplot for {cellName}</h2>
      <p>Number of total genes for {cellName} : {popupGenes.length} </p>
      <button
        className="closePopupButton"
        onClick={() => {
          setShowModal(false);
          setClickedTitle(false);
        }}>Close</button>
      <svg
        className="barplot"
        ref={popupSvgRef}
        width={calculateSvgWidth()}
        height={height * 2}
        style={{ ...barplotStyle, overflowX: 'auto' }}
      />
    </div>
  );

  return (
    <div data-testid="barplot">
      <svg className="barplot" ref={svgRef} width={width} height={height} style={barplotStyle} />
      <Popup
        open={showModal}
        closeOnDocumentClick={false}
        onClose={() => setShowModal(false)}
        onOpen={() => renderBarplot(popupGenes, popupSvgRef, drawBarplotFull)}
        contentStyle={popupStyle}
      >
        {popupContent}
      </Popup>
    </div>
  );
};

export default Barplot;