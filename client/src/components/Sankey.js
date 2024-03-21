import React, { useRef, useEffect, useState, useMemo } from "react";
import { BsDownload, BsInfoCircle } from 'react-icons/bs';
import { Container, Row, Col, Button, OverlayTrigger, Tooltip, Form, Alert } from 'react-bootstrap';
import ReactDOM from "react-dom/client";

import * as d3 from "d3";
import { jsPDF } from "jspdf";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import Barplot from "./Barplot.js";
import { color } from "../utils/Color.js";

import {
  NODE_WIDTH,
  NODE_PADDING,
  MINIMUM_OPACITY_STROKE,
  MAXIMUM_OPACITY_STROKE,
  NODE_TO_LINK_BOTTOM,
  BARPLOT_MINIMUM_HEIGHT,
  HORIZONTAL_PADDING,
  VERTICAL_PADDING,
  LAYOUT_WIDTH,
  LAYOUT_HEIGHT,
  ROOT_WIDTH,
  TOOLTIP_WIDTH,
  TOOLTIP_HEIGHT,
  TOOLTIP_FONT_SIZE,
  EXPORT_MARGIN_WIDTH,
  EXPORT_MARGIN_HEIGHT,
  EXPORT_ORIGIN_X,
  TOOLTIP_TRANSITON_DURATION
} from "../utils/Constants.js";

/**
 * Sankey component
 * 
 * @param {Object} sankeyStructure The sankeyStructure object
 * @param {String} title The title of the file
 * @param {Number} numberOfGenes The number of genes to display in the barplots
 * 
 * @returns {JSX.Element}
 */
export function Sankey({ sankeyStructure, title, numberOfGenes }) {
  // useRef hook to get the svg element
  const svgRef = useRef();

  // Moving the two maps inside the useEffect makes links and cellsMap not defined
  // We need to keep them outside of the useEffect
  const cellMapColor = useMemo(() => new Map(), []);
  const geneMapColor = useMemo(() => new Map(), []);

  const [opacity, setOpacity] = useState(false); // useState hook to toggle the opacity of the links
  const [alert, setAlert] = useState(false); // useState hook to show an alert if there are too many genes or populations

  // Fill the maps with the colors
  color(sankeyStructure, cellMapColor, geneMapColor);

  /**
   * useEffect hook to draw the Sankey diagram
   */
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

    // =====================
    //  OPACITY AND SCALING
    // =====================

    if (opacity) {
      // Links have a consensus value, ranging from 0 to 1
      // We need to find the maximum consensus value and use it to scale the stroke width of the links
      const maxConsensus = d3.max(structure.links, d => d.consensus);
      const minConsensus = d3.min(structure.links, d => d.consensus);
      const scale = d3.scaleLinear().domain([minConsensus, maxConsensus]).range([MINIMUM_OPACITY_STROKE, MAXIMUM_OPACITY_STROKE]);

      // We add a stroke attribute to the links to use it in the mouseover event
      structure.links.forEach(link => {
        link.stroke = scale(link.consensus);
      });
    } else {
      structure.links.forEach(link => {
        link.stroke = 1;
      });
    }

    // If there are more than 20 populations or 2000 genes, show an alert
    if (sankeyStructure.getSize() > 20 || sankeyStructure.getNumberOfGenes() > 2000) {
      setAlert(true);
    }

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
        const nodeHeight = d.y1 - d.y0 + NODE_TO_LINK_BOTTOM;
        const barplotWidth = nodeWidth;
        const barplotHeight = Math.max(nodeHeight, BARPLOT_MINIMUM_HEIGHT); // Ensure minimum height

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

        const cellName = structure.nodes.find((node) => node.x0 === d.x0 && node.y0 === d.y0).name;

        const component = (
          <Barplot
            width={barplotWidth}
            height={barplotHeight - 1}
            cellName={cellName}
            genes={sankeyStructure.get(cellName).geneMap}
            colorMap={geneMapColor}
            cellMapColor={cellMapColor}
            numberOfGenes={numberOfGenes}
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

        // ===================
        //       TOOLTIP
        // ===================

        // We also need to resize the tooltip according to the zoom level
        // We're not using svg.on("wheel") because it would get overwritten by the following lines
        const tooltip = d3.select(this.parentNode)
          .append("foreignObject")
          .attr("class", "tooltip")
          .attr("x", x)
          .attr("y", y)
          .attr("width", (TOOLTIP_WIDTH / svg.node().getScreenCTM().a) + "px")
          .attr("height", (TOOLTIP_HEIGHT / svg.node().getScreenCTM().d) + "px")
          .style("font-size", TOOLTIP_FONT_SIZE / svg.node().getScreenCTM().a + "px")
          .style("text-align", "center")
          .style("background-color", "white")
          .style("border", "1px solid black")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("opacity", 0);

        let tooltipContent = `<strong>${d.source.name} &rarr; ${d.target.name} </strong> <br>
          <strong>Population: </strong> ${d.value} <br>
          <strong>Consensus : </strong> ${d.consensus.toFixed(2)}`;

        tooltip.html(tooltipContent)
          .transition()
          .duration(TOOLTIP_TRANSITON_DURATION)
          .style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", d => d.stroke);
        // Remove tooltip
        d3.select(this.parentNode).selectAll(".tooltip").remove();
      });
  }, [sankeyStructure, opacity, geneMapColor, cellMapColor, numberOfGenes]);

  /**
   * Alert content if there are too many genes or populations
   * 
   * @param {*} totalGenes The number of genes in the diagram
   * @param {*} totalPopulations The number of populations in the diagram
   * 
   * @returns {JSX.Element} The alert content
   */
  const alertContent = (totalPopulations, totalGenes) => (
    <Alert variant="warning">
      You are about to visualize a diagram with <strong>{totalPopulations}</strong> populations and <strong>{totalGenes}</strong> genes. Colors might not be distinguishable.
    </Alert>
  );

  /**
   * Toggle the opacity of the links or not
   */
  const toggleOpacity = () => {
    setOpacity(!opacity);
  }

  /**
   * Handle the diagram's download as SVG
   * 
   * @returns {void}
   */
  const handleDownloadSVG = () => {
    const svg = d3.select(svgRef.current);
    const width = svg.node().getBBox().width + EXPORT_MARGIN_WIDTH;
    const height = svg.node().getBBox().height + EXPORT_MARGIN_HEIGHT;

    /// Grow the svg to avoid cutting the diagram
    svg.attr("width", width + "px");
    svg.attr("height", height + "px");

    // Serialize the svg to a string
    let inlineXML = new XMLSerializer().serializeToString(svg.node());

    // Create a blob from the svg string
    const blob = new Blob([inlineXML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    // Create a link and click it to download the svg
    const a = document.createElement("a");
    // Set the name of the file by removing the previous extension and adding .svg
    a.download = title.split(".").slice(0, -1).join(".") + ".svg";
    // Blank target to open the link in a new tab
    a.target = "_blank";
    // Security measure to prevent the tab from having access to the window.opener.location property
    a.rel = "noopener noreferrer";
    // Set the blob as the href
    a.href = url;
    // Click the link
    a.click();
  };

  /**
   * Handle the diagram's download as PDF
   * 
   * @returns {void}
   */
  const handleDownloadPDF = async () => {
    const svg = d3.select(svgRef.current);
    const width = svg.node().getBBox().width + EXPORT_MARGIN_WIDTH;
    const height = svg.node().getBBox().height + EXPORT_MARGIN_HEIGHT;

    // =====================
    //        LINKS
    // =====================

    // Clone the svg to avoid modifying the original
    const clone = svg.node().cloneNode(true);

    // jsPDF doesn't support transparency so we need to add a white background to the svg
    // otherwise everything will be black
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("fill", "white");
    clone.insertBefore(rect, clone.firstChild);

    // =====================
    //       BARPLOTS
    // =====================

    // Get all the foreignObjects
    const fO = clone.querySelectorAll("foreignObject");

    // Create a Map for x, y, width and height of every foreignObject
    const foreignCoords = new Map();
    fO.forEach(foreignObject => {
      foreignCoords.set(foreignObject, {
        x: foreignObject.getAttribute("x") - EXPORT_MARGIN_HEIGHT,
        y: foreignObject.getAttribute("y"),
        width: foreignObject.getAttribute("width"),
        height: foreignObject.getAttribute("height")
      });
    });

    // Get every <g> inside every <svg> that's inside a <foreignObject>
    const svgInsideFO = svg.selectAll("foreignObject").selectAll("svg");
    const gInsideSVG = svgInsideFO.selectAll("g");

    // Create a Map to fill with clones
    const gClones = new Map();
    gInsideSVG.nodes().forEach((g, i) => {
      gClones.set(i, g.cloneNode(true));
    });

    // Remove all foreignObjects from inlineXML because these ones are not supported by jsPDF
    fO.forEach(foreignObject => foreignObject.remove());

    // For every <g> clone, add a white background to it
    gClones.forEach((g, i) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", 0);
      rect.setAttribute("y", 0);
      rect.setAttribute("width", foreignCoords.get(fO[i]).width);
      rect.setAttribute("height", foreignCoords.get(fO[i]).height);
      rect.setAttribute("fill", "white");
      g.insertBefore(rect, g.firstChild);
    });

    // =====================
    //     SERIALIZATION
    // =====================

    // Serialize the svg to a string again
    const serializedLinks = new XMLSerializer().serializeToString(clone);

    // Serialize all the <g> clones
    const serializedBarplots = Array.from(gClones.values()).map(g => new XMLSerializer().serializeToString(g));

    // =====================
    //       DOCUMENT
    // =====================

    // Create a new jsPDF instance using the width and height of the svg
    // instead of page formats like "a1" or "letter"
    const doc = new jsPDF("landscape", "pt", [width, height]);

    // Add the links to the document
    await doc.addSvgAsImage(serializedLinks, EXPORT_ORIGIN_X, 0, width, height); // Asynchronous

    // Add the barplots to the document
    // Do not use forEach because it brings problems with async/await
    for (let i = 0; i < serializedBarplots.length; i++) {
      await doc.addSvgAsImage(serializedBarplots[i], Math.round(foreignCoords.get(fO[i]).x),
        Math.round(foreignCoords.get(fO[i]).y),
        Math.round(foreignCoords.get(fO[i]).width),
        Math.round(foreignCoords.get(fO[i]).height)); // Asynchronous
    }

    // Save the document
    doc.save(title.split(".").slice(0, -1).join(".") + ".pdf");
  }

  return (
    <div>
      <Container className="toolbar-container">
        <Row className="align-items-center">

          <Col className="text-center">
            <h5 className="mt-2">Selected diagram <span className="filename-span">{title}</span></h5>
          </Col>

          <Col className="text-center">
            <div className="download-buttons-container">
              <Button onClick={handleDownloadSVG} className="p-2 mr-2">
                <BsDownload className="bs-download" /> Download SVG
              </Button>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="pdf-tooltip">
                    <BsInfoCircle className="info-icon" />
                    Please note that transparency is not supported in PDFs. The background will be white and barplots will be rasterized.
                  </Tooltip>
                }
              >
                <Button onClick={handleDownloadPDF} variant="warning">
                  <BsDownload className="bs-download" /> Download PDF
                </Button>
              </OverlayTrigger>
            </div>
          </Col>

          <Col className="text-center">
            <h5 className="mt-2">Opacity</h5>
            <Form>
              <Form.Check
                onClick={toggleOpacity}
                type="switch"
              />
            </Form>
          </Col>

        </Row>
      </Container>

      <div className="alert-container">
        {alert && alertContent(sankeyStructure.getSize(), sankeyStructure.getNumberOfGenes())}
      </div>

      <TransformWrapper>
        <TransformComponent>
          <svg ref={svgRef} className="mt-2 sankey-svg"></svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}