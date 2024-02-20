import React from 'react';
import AppBar from '@mui/material/AppBar/AppBar.js';
import Toolbar from '@mui/material/Toolbar/Toolbar.js';
import Button from '@mui/material/Button/Button.js';
import { useNavigate } from 'react-router-dom';

export const MenuBar = () => {

    const navigate = useNavigate();

    const menuRedirection = (value) => {
        switch (value) {
            case "Home":
                navigate('/');
                break;
            case "Resultat":
                navigate('/result');
                break;
            case "Exemple":
                navigate('/');
                break;
            case "About":
                navigate('/');
                break;
            default:
                break;
        }
    };
    return (
        <AppBar position="static">
            <Toolbar className='appBar'>
                <Button color="inherit" onClick={() => menuRedirection("Home")}>Home</Button>
                <Button color="inherit" onClick={() => menuRedirection("Resultat")}>Result</Button>
                <Button color="inherit" onClick={() => menuRedirection("Exemple")}>Example</Button>
                <Button color="inherit" onClick={() => menuRedirection("About")}>About</Button>
            </Toolbar>
        </AppBar>
    );
}