import ReactDOM from "react-dom/client";
import React, { useRef, useEffect } from "react";

import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

import Barplot from "./Barplot";

/**
 * Sankey component
 * 
 * @returns {JSX.Element}
 */
export function Sankey() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const data = {
      nodes: [
        { name: "B", value: 20 },
        { name: "X", value: 30 },
        { name: "Y", value: 25 },
        { name: "J", value: 15 },
        { name: "K", value: 5 },
        { name: "L", value: 18 },
        { name: "Z", value: 22 }
      ],
      links: [
        { source: 0, target: 1, value: 3, info: "Info about link 1" },
        { source: 0, target: 2, value: 9, info: "Info about link 2" },
        { source: 1, target: 3, value: 2, info: "Info about link 3" },
        { source: 1, target: 4, value: 9, info: "Info about link 4" },
        { source: 2, target: 5, value: 4, info: "Info about link 5" },
        { source: 2, target: 6, value: 9, info: "Info about link 6" }
      ]
    };

    const sankeyLayout = sankey()
      .nodeWidth(150)
      .nodePadding(20)
      .extent([[0, 0], [1200, 420]]);

    const { nodes, links } = sankeyLayout(data);

    svg.selectAll("*").remove();

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
      .attr("stroke-width", d => d.value * 10)
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
          .style("border-radius", "5px");

        tooltip.append("xhtml:div")
          .html(`${d.source.name} -> ${d.target.name}, (${d.info})`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", 0.5);

        // Remove tooltip
        d3.select(this.parentNode).selectAll(".tooltip").remove();
      });


    const g = svg.append("g");

    // Draw nodes as Barplot components
    g.selectAll(".node")
      .data(nodes.slice(1))
      .join("g")
      .attr("class", "node")
      .each(function (d) {
        const foreignObject = d3.select(this)
          .append("foreignObject")
          .attr("x", d.x0)
          .attr("y", d.y0)
          .attr("width", d.x1 - d.x0)
          .attr("height", d.y1 - d.y0);
        const div = foreignObject.append("xhtml:div");
        const component = <Barplot width={(d.x1 - d.x0) - 2} height={(d.y1 - d.y0)-2} />;
        ReactDOM.createRoot(div.node()).render(component);
      });

      const root_width = 20;

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
    

  }, []);

  return (
    <svg className="" ref={svgRef} width="100vw" height="100vh"></svg>
  );
}