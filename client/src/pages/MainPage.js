import React from "react";
//import { FileContext } from "../context/SankeyFile.js";
import { MenuBar } from '../components/MenuBar.js';
import { Sankey } from "../components/Sankey.js";

export const MainPage = () => {
    //const fileContext = useContext(FileContext);
    return (
        <div className="main-page-principal-div">
            <MenuBar />
            <Sankey />
        </div>
    );
};