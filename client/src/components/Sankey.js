import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BsDownload } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import ReactDOM from "react-dom/client";

import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

import Barplot from "./Barplot.js";

/**
 * Sankey component
 * 
 * @returns {JSX.Element}
 */
export function Sankey() {
  // Create a reference to the SVG element
  const svgRef = useRef();
  // Get the current location
  const location = useLocation();
  // State for the title of the diagram
  const [title, setTitle] = useState("");

  useEffect(() => {
    // Create a map to store the cells data
    const cellsMap = new Map();

    // Create a data object to store the nodes and links
    const data = {
      nodes: [],
      links: []
    };

    // Get the route parameter
    if (location.state && location.state.data) {
      setTitle(location.state.title.split(".")[0]); // Set the title of the diagram by removing the extension
      const worksheets = location.state.data; // Retrieve data from location state

      // =====================
      //        SANKEY
      // =====================

      // Sort meta worksheets by alphanumerical order by the "" column which is the name of the node
      worksheets.get("meta").sort((a, b) => a[""].localeCompare(b[""]));

      // Create nodes
      worksheets.get("meta").forEach((d) => {
        data.nodes.push({ name: d[""] });
      });

      // Create links between nodes
      worksheets.get("meta").forEach((d) => {
        if (d["parent"]) {
          data.links.push({
            source: data.nodes.findIndex((node) => node.name === d["parent"]),
            target: data.nodes.findIndex((node) => node.name === d[""]),
            value: d["n"],
            consensus: d["consensus"],
            stroke: null
          });
        }
      });

      // ======================
      //        SCALING
      // ======================

      // Links all have a consensus value, ranging from 0 to 1
      // We need to find the maximum consensus value and use it to scale the stroke width of the links
      const maxConsensus = d3.max(data.links, d => d.consensus);
      const minConsensus = d3.min(data.links, d => d.consensus);
      const scale = d3.scaleLinear().domain([minConsensus, maxConsensus]).range([0.10, 1]);

      // We add the scaled stroke width to the links and round to two decimals
      data.links.forEach(d => {
        d.stroke = scale(d.consensus).toFixed(2);
      });

      // ======================
      //        BARPLOT
      // ======================
      for (let value of worksheets.get("markers").values()) {
        const genesMap = new Map();
        for (const [key, gene] of Object.entries(value)) {
          if (key !== "" && gene !== 0) {
            genesMap.set(key, gene);
          }
        }
        cellsMap.set(value[""], new Map([...genesMap.entries()]));
      }
    }

    // ===================
    //       LAYOUT
    // ===================
    // Create a new SVG element
    const svg = d3.select(svgRef.current).attr("display", "block");

    // Create a Sankey layout
    const sankeyLayout = sankey()
      .nodeWidth(200)
      .nodePadding(50)
      .nodeSort(d3.ascending)
      .extent([[0, 28], [1920, 1080]]); // Horizontal & vertical padding and width and height of the layout
    const { nodes, links } = sankeyLayout(data);

    svg.selectAll("*").remove(); // Clear the SVG

    const g = svg.append("g"); // Append a group to the SVG

    // Draw nodes as Barplot components
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

        const foreignObject = d3
          .select(this)
          .append("foreignObject")
          .attr("x", barplotX)
          .attr("y", barplotY)
          .attr("width", barplotWidth)
          .attr("height", barplotHeight);

        const div = foreignObject.append("xhtml:div");
        const cellName = data.nodes.find(
          (node) => node.x0 === d.x0 && node.y0 === d.y0
        ).name;
        const component = (
          <Barplot
            width={barplotWidth}
            height={barplotHeight - 1}
            cellName={cellName}
            genes={cellsMap.get(cellName)}
          />
        );
        ReactDOM.createRoot(div.node()).render(component);
      });

    const root_width = 30;

    // Append a rect for the first node of nodes to g
    g.append("rect")
      .attr("class", "root-node")
      .attr("x", nodes[0].x1 - root_width)
      .attr("y", nodes[0].y0)
      .attr("width", root_width)
      .attr("height", nodes[0].y1 - nodes[0].y0)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Draw links
    svg
      .append("g")
      .selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", d => d.stroke)
      .attr("stroke-width", d => Math.max(2, d.width)) // width of the link is a value between 2 and the width of the link
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
          .attr("width", 100)
          .attr("height", 40)
          .style("text-align", "center")
          .style("background-color", "white")
          .style("border", "1px solid black")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("opacity", 1);


        tooltip.append("xhtml:div")
          .html(`${d.source.name} -> ${d.target.name}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", d => d.stroke);
        // Remove tooltip
        d3.select(this.parentNode).selectAll(".tooltip").remove();
      });
  }, [location.state]);

  /**
   * Handle the diagram's download as SVG
   * 
   * @returns {void}
   */
  const handleDownloadSVG = () => {
    const svg = d3.select(svgRef.current);
    const svgString = new XMLSerializer().serializeToString(svg.node());
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    // Set the name of the file by removing the previous extension and adding .svg
    a.download = location.state.title.split(".")[0] + ".svg";
    // Blank target to open the link in a new tab
    a.target = "_blank";
    // Security measure to prevent the tab from having access to the window.opener.location property
    a.rel = "noopener noreferrer";
    // Set the blob as the href
    a.href = url;
    a.click();
  };

  return (
    <div className="sankey">
      <h3 className="selected-diagram text-center">Selected diagram: <span className="filename-span">{title}</span></h3>
      <div className="download-buttons-container">
        <Button onClick={handleDownloadSVG}>
          <BsDownload className="bs-download" /> Download SVG
        </Button>
      </div>
      <svg ref={svgRef} width="120vw" height="200vh"></svg>
    </div>
  );
}