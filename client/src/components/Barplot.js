import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const Barplot = ({ width, height, cellName, genes }) => {
  const svgRef = useRef();
  const popupSvgRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [popupGenes, setPopupGenes] = useState([]);
  const [clickedTitle, setClickedTitle] = useState(false);
  const [popupLabelsLength, setPopupLabelsLength] = useState(0);
  const SPACE_BETWEEN_BARS_FACTOR = 4;

  useEffect(() => {
    const dataToRender = clickedTitle ? genes.entries() : Array.from(genes.entries()).slice(0, 3);
    renderBarplot(dataToRender, svgRef, drawBarplotSliced);
  }, [width, height, cellName, genes, clickedTitle, drawBarplotSliced]);

  // Draw barplot Sliced
  function drawBarplotSliced(data,originalWidth, originalHeight, svg) {
    const labels = Array.from(data).map(([gene]) => gene);

    const scaleFactor = Math.min(width / originalWidth, height / originalHeight);

    // Scaled dimensions
    const scaledWidth = originalWidth * scaleFactor;
    const scaledHeight = originalHeight * scaleFactor;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data.map(([gene, v]) => v))]).range([scaledHeight, 0]);

    // Create and append <g> tag
    // Adjust positioning to center the barplot within the node
    const g = svg.append("g").attr("transform", `translate(${(width - scaledWidth) / 2}, ${(height - scaledHeight) / 2})`);

    // Draw bars
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (scaledWidth / data.length))
      .attr("y", ([, v]) => yScale(v))
      .attr("width", (scaledWidth / data.length - SPACE_BETWEEN_BARS_FACTOR))
      .attr("height", ([, v]) => scaledHeight - yScale(v))
      .attr("fill", "steelblue");

    // Add legend text
    g.selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", (d, i) => i * (scaledWidth / labels.length) + (scaledWidth / labels.length - 10) / 2)
      .attr("y", scaledHeight)
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
      .attr("fill", "black")
      .on("click", () => {
        setPopupGenes(genes.entries());
        setShowModal(true);
        setClickedTitle(true);
        
      });
  }

  // Draw Full Barplot
  function drawBarplotFull(data, originalWidth, originalHeight, svg) {
    const labels = Array.from(data).map(([gene]) => gene);
    setPopupLabelsLength(labels.length);
    console.log(labels.length);
    const scaleFactor = Math.min(width / originalWidth, height / originalHeight);

    // Scaled dimensions
    const scaledWidth = originalWidth * scaleFactor;
    const scaledHeight = originalHeight * scaleFactor;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data.map(([gene, v]) => v))]).range([scaledHeight, 0]);

    // Create and append <g> tag
    // Adjust positioning to center the barplot within the node
    const g = svg.append("g").attr("transform", `translate(${(width - scaledWidth) / 2}, ${(height - scaledHeight) / 2})`);

    // Draw bars
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (scaledWidth / data.length))
      .attr("y", ([, v]) => yScale(v))
      .attr("width", (scaledWidth / data.length - SPACE_BETWEEN_BARS_FACTOR)) // Adjust width for spacing between bars
      .attr("height", ([, v]) => scaledHeight - yScale(v))
      .attr("fill", "steelblue");

    // Add legend text
    g.selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", (d, i) => i * (scaledWidth / labels.length + 50))
      .attr("y", scaledHeight)
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

  const renderBarplot = (data, svgReference, drawFunction) => {
    const svg = d3.select(svgReference.current);
    svg.selectAll("*").remove();

    // Calculate scaling factor
    const originalWidth = 130; // default width of the barplot
    const originalHeight = 80; // default height of the barplot

    // Ignore First cell
    if (cellName !== "C") {
      drawFunction(data, originalWidth, originalHeight, svg);
    }
  };


  // Declare style for the barplot
  const barplotStyle = {
    border: "1px solid #d3d3d3",
    borderRadius: "5px",
  };

  // Define custom styles for the popup content
  const popupStyle = {
    width: '100%%',
    height: '80%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    background: '#fff',
    overflow: 'auto',
  };

  const popupContent = (
    <div>
      <h2>Histogram for {cellName}</h2>
      <button 
      className="closePopupButton" 
      onClick={() => {
        setShowModal(false);
        setClickedTitle(false);
      }}>Close</button>
      <svg className="barplot" ref={popupSvgRef} width={((width * popupLabelsLength) / SPACE_BETWEEN_BARS_FACTOR) + (popupLabelsLength*2)} height={height * 8} style={{ ...barplotStyle, overflowX: 'auto' }} />
    </div>
  );

  return (
    <div>
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