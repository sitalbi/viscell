import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { Sankey } from './Sankey.js';
import { useNavigate } from 'react-router-dom';
import exampleData from '../data/inverted.xlsx';

export const Example = () => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(exampleData);
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const worksheets = new Map();
                workbook.SheetNames.forEach((sheetName) => {
                    if (sheetName !== "cells" && (sheetName === "meta" || sheetName === "markers")) {
                        const sheet = workbook.Sheets[sheetName];
                        worksheets.set(sheetName, XLSX.utils.sheet_to_json(sheet));
                    }
                });
                setData(worksheets);
                navigate('/example', { state: { data: worksheets } });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2 className="text-center">Example Page</h2>
                    {/* Afficher le diagramme de Sankey si les données sont disponibles */}
                    {data && <Sankey data={data} />}
                </Col>
            </Row>
        </Container>
    );
};
