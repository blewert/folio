//
import '@/styles/index.sass'

//Import components
import { Frontpage } from "@/pages/Frontpage.jsx";
import { Projects } from "@/pages/Projects.jsx"

//Import react
import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import { createRoot } from "react-dom/client";

import { DataContext } from '@/js/DataContext.js';

//----------


async function main()
{
    //Create root
    const root = createRoot(document.getElementById("root"));

    root.render(
        <HashRouter>
            <Route exact path="/">
                <Frontpage/>
            </Route>
            <Route exact path="/projects">
                <Projects/>
            </Route>
        </HashRouter>);
}

main();
