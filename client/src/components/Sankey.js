import React, { useRef, useEffect } from "react";
import { BsDownload } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import ReactDOM from "react-dom/client";

import * as d3 from "d3";
import { Canvg } from 'canvg';
// import { jsPDF } from "jspdf";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import Barplot from "./Barplot.js";
import { color } from "../utils/Color.js";

import {
  NODE_WIDTH,
  NODE_PADDING,
  HORIZONTAL_PADDING,
  VERTICAL_PADDING,
  LAYOUT_WIDTH,
  LAYOUT_HEIGHT,
  ROOT_WIDTH,
  TOOLTIP_WIDTH,
  TOOLTIP_HEIGHT
} from "../utils/Constants.js";

/**
 * Sankey component
 * 
 * @param {Object} sankeyStructure The sankeyStructure object
 * @param {String} title The title of the file
 * 
 * @returns {JSX.Element}
 */
export function Sankey({ sankeyStructure, title }) {
  const svgRef = useRef();
  // Moving the two maps inside the useEffect makes links and cellsMap not defined
  // We need to keep them outside of the useEffect
  const cellMapColor = new Map();
  const geneMapColor = new Map();


  color(sankeyStructure, cellMapColor, geneMapColor);

  useEffect(() => {
    // =====================
    //        SANKEY
    // =====================

    // Create the structure for the sankey diagram
    const structure = {
      nodes: [],
      links: []
    };

    // Create the nodes and links for the sankey diagram
    sankeyStructure.createNodesAndLinks(structure);

    // ===================
    //       LAYOUT
    // ===================

    // Create the sankey layout
    const svg = d3.select(svgRef.current).attr("display", "block");
    const sankeyLayout = sankey()
      .nodeWidth(NODE_WIDTH)
      .nodePadding(NODE_PADDING)
      .nodeSort(d3.ascending)
      .extent([[HORIZONTAL_PADDING, VERTICAL_PADDING], [LAYOUT_WIDTH, LAYOUT_HEIGHT]]);
    const { nodes, links } = sankeyLayout(structure);

    // Clear the svg
    svg.selectAll("*").remove();

    // Create a group for the nodes
    const g = svg.append("g");

    // Draw nodes as Barplot components except for the first one
    g.selectAll(".node")
      .data(nodes.slice(1))
      .join("g")
      .attr("class", "node")
      .each(function (d) {
        const nodeWidth = d.x1 - d.x0;
        const nodeHeight = d.y1 - d.y0 + 5;
        const barplotWidth = nodeWidth;
        const barplotHeight = Math.max(nodeHeight, 50); // Ensure minimum height

        // Calculate position for Barplot
        const barplotX = d.x0; // Adjust as needed
        const barplotY = d.y0 + (nodeHeight - barplotHeight) / 2; // Adjust as needed

        // Append a foreignObject to the node
        const foreignObject = d3
          .select(this)
          .append("foreignObject")
          .attr("x", barplotX)
          .attr("y", barplotY)
          .attr("width", barplotWidth)
          .attr("height", barplotHeight);

        const div = foreignObject.append("xhtml:div");

        const cellName = structure.nodes
          .find((node) =>
            node.x0 === d.x0 && node.y0 === d.y0
          ).name;

        const component = (
          <Barplot
            width={barplotWidth}
            height={barplotHeight - 1}
            cellName={cellName}
            genes={sankeyStructure.get(cellName).geneMap}
            colorMap={geneMapColor}
          />
        );
        ReactDOM.createRoot(div.node()).render(component);
      });

    g.append("rect")
      .attr("class", "root-node")
      .attr("x", nodes[0].x1 - ROOT_WIDTH)
      .attr("y", nodes[0].y0)
      .attr("width", ROOT_WIDTH)
      .attr("height", nodes[0].y1 - nodes[0].y0)
      .attr("fill", "grey")
      .attr("stroke", "lightgrey")
      .attr("stroke-width", 2);

    // Title of the first node
    g.append("text")
      .attr("class", "root-node-title")
      .attr("x", nodes[0].x1 - ROOT_WIDTH / 2)
      .attr("y", (nodes[0].y1 + nodes[0].y0) / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("fill", "black")
      .text(nodes[0].name);

    // Draw links
    svg
      .append("g")
      .selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", d => {
        return cellMapColor.get(d.target.name);
      })
      .attr("stroke-opacity", d => d.stroke)
      .attr("stroke-width", d => Math.max(2, d.width)) // Width of the link is a value between 2 and the width of the link
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", 1)
          .attr("cursor", "pointer");

        const [x, y] = d3.pointer(event);

        // Show tooltip
        const tooltip = d3.select(this.parentNode)
          .append("foreignObject")
          .attr("class", "tooltip")
          .attr("x", x)
          .attr("y", y)
          .attr("width", TOOLTIP_WIDTH)
          .attr("height", TOOLTIP_HEIGHT)
          .style("text-align", "center")
          .style("background-color", "white")
          .style("border", "1px solid black")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("opacity", 1);

        tooltip.append("xhtml:div")
          .html(`${d.source.name} -> ${d.target.name} <br>
          Population: ${d.value} <br>
          Consensus : ${d.consensus.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", d => d.stroke);
        // Remove tooltip
        d3.select(this.parentNode).selectAll(".tooltip").remove();
      });
  });

  /**
   * Handle the diagram's download as SVG
   * 
   * @returns {void}
   */
  const handleDownloadSVG = () => {
    const svg = d3.select(svgRef.current);
    const originalWidth = svg.attr("width");
    const originalHeight = svg.attr("height");

    /// Grow the svg to the size of the diagram
    svg.attr("width", "400vw");
    svg.attr("height", "400vh");

    // Serialize the svg to a string
    const svgString = new XMLSerializer().serializeToString(svg.node());

    // Reset the svg to its original size
    svg.attr("width", originalWidth);
    svg.attr("height", originalHeight);

    // Create a blob from the svg string
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    // Set the name of the file by removing the previous extension and adding .svg
    a.download = title.split(".").slice(0, -1).join(".") + ".svg";
    // Blank target to open the link in a new tab
    a.target = "_blank";
    // Security measure to prevent the tab from having access to the window.opener.location property
    a.rel = "noopener noreferrer";
    // Set the blob as the href
    a.href = url;
    a.click();
  };

  /**
   * Handle the diagram's download as PNG
   * 
   * @returns {void}
   */
  const handleDownloadPNG = async () => {
    const svg = d3.select(svgRef.current);
    const originalWidth = svg.attr("width");
    const originalHeight = svg.attr("height");

    /// Grow the svg to the size of the diagram
    svg.attr("width", "400vw");
    svg.attr("height", "400vh");

    // Serialize the svg to a string
    const svgString = new XMLSerializer().serializeToString(svg.node());

    // Reset the svg to its original size
    svg.attr("width", originalWidth);
    svg.attr("height", originalHeight);

    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = originalWidth;
    canvas.height = originalHeight;

    // Get the context of the canvas
    const context = canvas.getContext("2d");

    // Create Canvg instance
    const canvgInstance = await Canvg.fromString(context, svgString);

    // Render SVG onto the canvas
    await canvgInstance.render();

    // Convert canvas to PNG image
    const pngDataUrl = canvas.toDataURL("image/png");

    // Create a link element to trigger the download
    const a = document.createElement("a");
    a.download = title.split(".").slice(0, -1).join(".") + ".png";
    a.href = pngDataUrl;
    a.click();
  }

  return (
    <div className="sankey">
      <h3 className="selected-diagram text-center">Selected diagram: <span className="filename-span">{title}</span></h3>

      <div className="download-buttons-container">
        <Button onClick={handleDownloadSVG}>
          <BsDownload className="bs-download" /> Download SVG
        </Button>
        <Button onClick={handleDownloadPNG}>
          <BsDownload className="bs-download" /> Download PNG
        </Button>
      </div>

      <TransformWrapper>
        <TransformComponent>
          <svg ref={svgRef} width="100vw" height="150vh"></svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}