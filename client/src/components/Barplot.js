import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "react-bootstrap";
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
const Barplot = ({ width, height, cellName, genes, colorMap }) => {
  const svgRef = useRef();
  const popupSvgRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [popupGenes, setPopupGenes] = useState([]);
  const [clickedTitle, setClickedTitle] = useState(false);

  const POPUP_MAX_SIZE = 300;
  const POPUP_TOP_MARGIN = 50;

  /**
   * Open a new tab with the gene page
   */
  const onBarClick = function () {
    const geneName = d3.select(this).data()[0];
    window.open(`https://pubchem.ncbi.nlm.nih.gov/gene/${geneName}/Homo_sapiens`);
  }
  /**
   * Change opacity and display gene name on mouse over
   */
  const mouseOverBar = function (event) {
    d3.select(this)
      .attr("opacity", 0.5)
      .attr("cursor", "pointer");

    const geneName = d3.select(this).attr("name");

    // Mouse position
    const mouseX = event.pageX;
    const mouseY = event.pageY;

    // Create the tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("left", `${mouseX}px`)
      .style("top", `${mouseY}px`)
      .style("background-color", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("opacity", 0);

    // Display the gene name
    tooltip.html(`<strong>Gene:</strong> ${geneName}`)
      .transition()
      .duration(200)
      .style("opacity", 1);
  }

  /**
   * Reset opacity on mouse out
   */
  const mouseOutBar = function () {
    d3.select(this).attr("opacity", null);
    d3.selectAll(".tooltip").remove();
  }

  /**
   * Render barplot using useCallback hook
   */
  const renderBarplot = useCallback((data, svgReference, drawFunction) => {
    const svg = d3.select(svgReference.current);
    svg.selectAll("*").remove();

    // Calculate scaling factor
    const originalWidth = width; // Default width of the barplot
    const originalHeight = height - 10; // Default height of the barplot

    // Ignore first cell
    if (cellName !== "C") {
      drawFunction(data, originalWidth, originalHeight, svg);
    }
  }, [cellName, height, width]);


  const legendSize = function (size) {
    const maxSize = 10 // Max size for text font
    const factor = 16
    const textSize = size / factor

    if (textSize > maxSize)
      return maxSize
    return textSize
  }

  // Draw Sliced Barplot
  const drawBarplotSliced = useCallback((data, originalWidth, originalHeight, svg) => {
    const labels = Array.from(data).map(([gene]) => gene);
    const scaleFactor = Math.min(width / originalWidth, height / originalHeight);

    // Scaled dimensions
    const scaledHeight = originalHeight * scaleFactor
    
    // Space in between bars
    const space = 5;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear().domain([0, d3.max(data.map(([, v]) => v))]).range([scaledHeight, 0]);

    // Create and append <g> tag
    // Adjust positioning to center the barplot within the node
    const g = svg.append("g").attr("transform", `translate(${(width - originalWidth) / 2}, ${(height - scaledHeight) / 2})`);

    svg.on("mouseover", function () {
      d3.select(this)
        .attr("cursor", "pointer");
    });

    // Add on click event to the svg
    svg.on("click", () => {
      setShowModal(true);
      setClickedTitle(true);
    });

    svg.attr("data-testid", "barplot-svg");



    // Draw bars and color them using colorMap
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_d, i) => i * (originalWidth / data.length))
      .attr("y", ([, v]) => yScale(v))
      .attr("width", (originalWidth / data.length - space))
      .attr("height", ([, v]) => scaledHeight - yScale(v) - 30)
      .attr("data-testid", "bar-rectangle")
      .attr("data-testid", (d, i) => `bar-${labels[i]}`)
      .attr("fill", (d, i) => colorMap.get(labels[i]));

    // Add on BarClick
    g.selectAll("rect")
      .on("click", onBarClick)
      .data(labels)
      .attr("name", d => d)
      .style("cursor", "pointer")
      .on('mouseover', mouseOverBar)
      .on('mouseout', mouseOutBar)

    //Add legend text
    g.selectAll("text.legend")
      .data(labels)
      .enter()
      .append("text")
      .text(d => d)
      .attr("class", "legend")
      .attr("x", (_d, i) => i * (originalWidth / labels.length) + (originalWidth / labels.length) / 2)
      .attr("y", scaledHeight - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", legendSize(originalWidth) + "px")
      .attr("font-weight", "bold")
      .attr("fill", "black");

  }, [width, height, colorMap]);

  // Draw full Barplot on click
  function drawBarplotFull(data, _originalWidth, originalHeight, svg) {
    const labels = Array.from(data).map(([gene]) => gene);
    const totalBarplots = popupGenes.length;

    // Scale for mapping data values to pixel values
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.map(([, v]) => v))])
      .range([originalHeight, 0]);

    // Calculate bar width and spacing to fit within the SVG width
    // Each bar takes an equal portion of the SVG width minus the space for spacing
    const barWidth = (calculateSvgWidth() - (totalBarplots - 1) * 5) / totalBarplots;
    const barSpacing = 5; // Spacing between bars
    const svgMargin = 50; // Margin to not start the bars at the edge of the SVG

    // Add X axis for legend
    const xScale = d3.scaleBand()
      .domain(labels)
      .range([svgMargin, calculateSvgWidth() + svgMargin]);
    const xAxis = d3.axisBottom(xScale);
    // Add X axis to the SVG
    const xAxisGroup = svg.append("g")
      .attr("transform", `translate(0, ${originalHeight + svgMargin + POPUP_TOP_MARGIN})`) // Adjust the y-coordinate as needed
      .call(xAxis);
    // Style the X axis
    xAxisGroup.selectAll("text")
      .attr("font-size", "10px")
      .attr("font-weight", "bold");

    // Draw bars
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_d, i) => i * (barWidth + barSpacing) + svgMargin)
      .attr("y", ([, v]) => yScale(v) + POPUP_TOP_MARGIN)
      .attr("width", barWidth)
      .attr("height", ([, v]) => originalHeight - yScale(v) + 40)
      .attr("data-testid", "bar-rectangle")
      .attr("fill", (d, i) => colorMap.get(labels[i]));

    // Add text to each rectangle with the value
    svg.selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .text(d => d[1])
      .attr("class", "value")
      .attr("x", (_d, i) => i * (barWidth + barSpacing) + barWidth / 2 + svgMargin)
      .attr("y", ([, v]) => yScale(v) + 30) // Adjust the y-coordinate as needed
      .attr("text-anchor", "middle") // Center the text horizontally
      .attr("font-weight", "bold")
      .attr("fill", "black"); // Adjust the text color as needed

    // Add on BarClick
    svg.selectAll("rect")
      .on("click", onBarClick)
      .data(labels)
      .attr("name", d => d)
      .style("cursor", "pointer")
      .on('mouseover', mouseOverBar)
      .on('mouseout', mouseOutBar);

  }

  useEffect(() => {
    // Only call drawBarplotSliced if clickedTitle is false
    if (!clickedTitle) {
      const dataSort = Array.from(genes.entries()).sort((a, b) => b[1] - a[1]);
      setPopupGenes(dataSort);
      const dataToRender = dataSort.slice(0, 3);
      renderBarplot(dataToRender, svgRef, drawBarplotSliced);
    }
  }, [width, height, cellName, genes, colorMap, clickedTitle, renderBarplot, drawBarplotSliced]);

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
    width: '80%',
    height: '80%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    background: '#fff',
    overflow: 'auto',
  };

  const popupContent = (
    <div>
      <h2>Population <span className="population-span">{cellName}</span></h2>
      <p>Total number of genes for {cellName} : {popupGenes.length} </p>
      <svg
        className="barplot"
        ref={popupSvgRef}
        width={calculateSvgWidth() + 70}
        height={POPUP_MAX_SIZE}
        style={{ ...barplotStyle, overflowX: 'auto' }}
      />
      <Button
        variant="danger"
        onClick={() => {
          setShowModal(false);
          setClickedTitle(false);
        }}>Close</Button>
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