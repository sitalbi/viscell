import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { select as d3Select } from "d3-selection";
import ReactDOM from "react-dom/client";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import BarplotNode from "./Barplot";

export function Sankey() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const data = {
      nodes: [
        { name: "A", value: 10 },
        { name: "B", value: 20 },
        { name: "X", value: 30 },
        { name: "Y", value: 25 },
        { name: "J", value: 15 },
        { name: "K", value: 5 },
        { name: "L", value: 18 },
        { name: "Z", value: 22 }
      ],
      links: [
        { source: 0, target: 2, value: 5, info: "Info about link 1" },
        { source: 0, target: 3, value: 7, info: "Info about link 2" },
        { source: 1, target: 2, value: 3, info: "Info about link 3" },
        { source: 1, target: 3, value: 9, info: "Info about link 4" },
        { source: 2, target: 4, value: 2, info: "Info about link 5" },
        { source: 2, target: 5, value: 9, info: "Info about link 6" },
        { source: 3, target: 6, value: 4, info: "Info about link 7" },
        { source: 3, target: 7, value: 9, info: "Info about link 8" }
      ]
    };

    const sankeyLayout = sankey()
      .nodeWidth(150)
      .nodePadding(20)
      .extent([[1, 1], [1200, 400]]);

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
      .on("mouseover", function(d) {
        d3.select(this)
          .attr("stroke-opacity", 1)
          .append("title")
          .text(d.info);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke-opacity", 0.5)
          .select("title")
          .remove();
      });

    // Draw nodes as BarplotNode components
    svg
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .each(function(d) {
        const foreignObject = d3Select(this)
          .append("foreignObject")
          .attr("x", d.x0)
          .attr("y", d.y0)
          .attr("width", d.x1 - d.x0)
          .attr("height", d.y1 - d.y0);

        const div = foreignObject.append("xhtml:div");
        const component = <BarplotNode x={d.x0} y={d.y0} width={d.x1 - d.x0} height={d.y1 - d.y0} />;
        ReactDOM.createRoot(div.node()).render(component);
      });

  }, []);

  return (
    <svg ref={svgRef} width="100vw" height="50vh">
      <g transform="translate(50, 20)" />
    </svg>
  );
}
