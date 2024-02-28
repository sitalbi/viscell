import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import ReactDOM from "react-dom";
import Barplot from "./Barplot.js";

/**
 * Sankey component
 * 
 * @returns {JSX.Element}
 */
export function Sankey() {
  const svgRef = useRef();
  const location = useLocation();
  const cellsMap = new Map();

  useEffect(() => {
    const data = {
      nodes: [],
      links: []
    };

    // Get the route parameter
    if (location.state && location.state.data) {
      // Retrieve data from location state
      const worksheets = location.state.data;

      // SANKEY
      // sort by alphanumerical order the  meta worksheets by "" column which is the name of the node
      worksheets.get("meta").sort((a, b) => a[""].localeCompare(b[""]));


      worksheets.get("meta").forEach((d) => {
        data.nodes.push({ name: d[""] });
      });

      worksheets.get("meta").forEach((d) => {
        if (d["parent"]) {
          data.links.push({
            source: data.nodes.findIndex((node) => node.name === d["parent"]),
            target: data.nodes.findIndex((node) => node.name === d[""]),
            value: d["n"]
          });
        }
      });

      // BARPLOT
      for (let value of worksheets.get("markers").values()) {
        const genesMap = new Map();
        for (const [key, gene] of Object.entries(value)) {
          if (key !== "") {
            if (gene !== 0) {
              genesMap.set(key, gene);
            }
          }
        }
        cellsMap.set(value[""], new Map([...genesMap.entries()].slice(0, 3)));
      }
    }

    const svg = d3.select(svgRef.current).attr("display", "block");

    const sankeyLayout = sankey()
      .nodeWidth(200)
      .nodePadding(55)
      .nodeSort(d3.ascending)
      .extent([[0, 0], [1920, 1080]]);
    const { nodes, links } = sankeyLayout(data);

    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Draw nodes as Barplot components
    g.selectAll(".node")
      .data(nodes.slice(1))
      .join("g")
      .attr("class", "node")
      .each(function (d) {
        const barplotHeight = 70;
        const nodeWidth = d.x1 - d.x0;
        const nodeHeight = d.y1 - d.y0 > barplotHeight ? d.y1 - d.y0 : barplotHeight;

        // Calculate center position of the node
        const centerX = d.x0 + nodeWidth / 2;
        const centerY = d.y0 + nodeHeight / 2;

        // Calculate position for Barplot
        const barplotX = centerX - 100; // Adjust as needed
        const barplotY = centerY - barplotHeight / 2;

        const foreignObject = d3.select(this)
          .append("foreignObject")
          .attr("x", barplotX)
          .attr("y", barplotY)
          .attr("width", 200) // Fixed width for Barplot
          .attr("height", barplotHeight);

        const div = foreignObject.append("xhtml:div");
        const cellName = data.nodes.find((node) => node.x0 === d.x0 && node.y0 === d.y0).name;
        const component = <Barplot width={200} height={barplotHeight} cellName={cellName} genes={cellsMap.get(cellName)} />;
        ReactDOM.createRoot(div.node()).render(component);
      });

    // Draw nodes as rects for debug
    /*g.selectAll(".node")
      .data(nodes.slice(1))
      .join("rect")
      .attr("class", "node")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0 > 50 ? d.y1 - d.y0 : 50)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .attr("stroke-width", 2);*/


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
      .attr("stroke-opacity", 0.5)
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
          .attr("height", 100)
          .style("background-color", "white")
          .style("border", "1px solid black")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("opacity", 1);


        tooltip.append("xhtml:div")
          .html(`${d.source.name} -> ${d.target.name}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", 0.5);
        // Remove tooltip
        d3.select(this.parentNode).selectAll(".tooltip").remove();
      });


  });

  return (
    <div className="sankey">
      <svg ref={svgRef} width="120vw" height="200vh"></svg>
    </div>
  );
}