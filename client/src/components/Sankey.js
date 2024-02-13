import React from 'react';
import {Chart} from 'react-google-charts';


export const Sankey = () => {
    
    const data = [
        ["From", "To", "Weight"],
        ["A", "X", 5],
        ["A", "Y", 7],
        ["A", "Z", 6],
        ["B", "X", 2],
        ["B", "Y", 9],
        ["B", "Z", 4],
      ];

    return (
        <Chart
        chartType="Sankey"
        width="40%"
        height="200px"
        data={data}
        />
    );

};