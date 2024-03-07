import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

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
  const popupSvgRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [popupGenes, setPopupGenes] = useState([]);
  const [clickedTitle, setClickedTitle] = useState(false);

  const _popUpMaxSize = 150;

  var onBarClick = function () {
    const geneName = d3.select(this).data()[0];
    // go to hyperlink
    window.open(`https://pubchem.ncbi.nlm.nih.gov/gene/${geneName}/Homo_sapiens`);
  }

  var mouseOverBar = function () {
    d3.select(this).attr("opacity", 0.5);
  }

  var mouseOutBar = function () {
    d3.select(this).attr("opacity", null);
  }

  const renderBarplot = useCallback((data, svgReference, drawFunction) => {
    const svg = d3.select(svgReference.current);
    svg.selectAll("*").remove();

    // Calculate scaling factor
    const originalWidth = 100; // default width of the barplot
    const originalHeight = 60; // default height of the barplot

    // Ignore First cell
    if (cellName !== "C") {
      drawFunction(data, originalWidth, originalHeight, svg);
    }
  }, [cellName]);

  const legendSize = function (size) {

    const maxSize = 10 // max size for text font
    const factor = 16

    const textSize = size/factor

    if (textSize > maxSize)
      return maxSize

    
    return textSize
  }

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
      .attr("y", ([, v]) => yScale(v) + 10) //TODO : Change magic number 20
      .attr("width", (scaledWidth / data.length - space))
      .attr("height", ([, v]) => scaledHeight - yScale(v) - 40)
      .attr("data-testid", "bar-rectangle")
      .attr("data-testid", (d, i) => `bar-${labels[i]}`)
      .attr("fill", "steelblue");

    // Add on BarClick
    g.selectAll("rect")
      .on("click", onBarClick)
      .data(labels)
      .attr("name", d => d)
      .style("cursor", "pointer")
      .on('mouseover', mouseOverBar)
      .on('mouseout', mouseOutBar);

    // Add legend text
    g.selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", (_d, i) => i * (scaledWidth / labels.length) + (scaledWidth / labels.length) / 2)
      .attr("y", scaledHeight - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", legendSize(scaledWidth)+"px")
      .attr("font-weight", "bold")
      .attr("fill", "black");

    // Title of cell
    g.append("text")
      .text(`${cellName}`)
      .attr("x", scaledWidth / 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", legendSize(scaledWidth)+"px")
      .attr("font-weight", "bold")
      .attr("fill", "black")



    // Add button
    g.append("rect")
    .attr("x", scaledWidth / 2 - 25) // Ajuster la position x
    .attr("y", scaledHeight - 15) // Ajuster la position y
    // have the rectangle scaled to the size of the scaledWidth and scaledHeight

    .attr("fill", "lightgray") // Couleur du bouton
    .style("cursor", "pointer") // Style du curseur
    .on("click", () => {
      setShowModal(true);
      setClickedTitle(true);
    });

    // Ajouter le texte sur le bouton
    g.append("text")
      .text("Open")
      .attr("x", scaledWidth / 2)
      .attr("y", scaledHeight - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", scaledHeight/10+"px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .style("cursor", "pointer")
      .on("click", () => {
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

    // Add on BarClick
    svg.selectAll("rect")
      .on("click", onBarClick)
      .data(labels)
      .attr("name", d => d)
      .style("cursor", "pointer")
      .on('mouseover', mouseOverBar)
      .on('mouseout', mouseOutBar);

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
      const dataSort = Array.from(genes.entries()).sort((a, b) => b[1] - a[1]);
      setPopupGenes(dataSort);
      const dataToRender = dataSort.slice(0, 3);
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
    width: '100%',
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
        height={_popUpMaxSize} 
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