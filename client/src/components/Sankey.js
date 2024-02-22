import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

/**
 * Sankey component
 * 
 * @returns {JSX.Element}
 */
export function Sankey() {
  const svgRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const data = {
      nodes: [],
      links: []
    };

    const svg = d3.select(svgRef.current).attr("display", "block");

    if (location.state && location.state.data) {
      // Retrieve data from location state
      const worksheets = location.state.data;

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
            value: d["n"] * 0.002
          });
        }
      });

    }

    const sankeyLayout = sankey()
      .nodeWidth(150)
      .extent([[5, -5], [1920, 720]]);
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
        console.log(d);
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
    /*g.selectAll(".node")
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
        const component = <Barplot width={150} height={70} />;
        ReactDOM.createRoot(div.node()).render(component);
      });*/

    // Draw nodes as rects for debug
    g.selectAll(".node")
      .data(nodes.slice(1))
      .join("rect")
      .attr("class", "node")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .attr("stroke-width", 2);


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
  }, [location.state]);

  return (
    <div className="sankey">
      <svg ref={svgRef} width="100vw" height="100vh"></svg>
    </div>
  );
}