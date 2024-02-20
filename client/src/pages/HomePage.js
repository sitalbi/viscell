import React from "react";
import { Helmet } from "react-helmet";
import { ImportFile } from "../components/ImportFile.js";
import "./HomePage.css";

export const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>viscell</title>
      </Helmet>
      <div className="importFile">
        <ImportFile />
      </div>
    </div>
  );
}