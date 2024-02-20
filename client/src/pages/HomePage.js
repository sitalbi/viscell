import React from "react";
import { Helmet } from "react-helmet"
import "./HomePage.css";

import { ImportFile } from "../components/ImportFile.js";
import { MenuBar } from '../components/MenuBar.js';

export const HomePage = () => {
  return (
    <div className="Home">
      <Helmet>
        <title>viscell</title>
      </Helmet>
      <MenuBar />

      <div className="importFile">
        <ImportFile />
      </div>
    </div>
  );
}