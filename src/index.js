//
import '@/styles/index.sass'

//Import components
import { Frontpage } from "@/pages/Frontpage.jsx";
import { Projects } from "@/pages/Projects.jsx";
import Project from "@/pages/Project.jsx";

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
            <Route exact path="/projects">
                <Projects />
            </Route>
            <Route exact path="/blog">
                <Projects title="Posts" dataKey="posts" dataPath="posts/posts.json" />
            </Route>
            <Route path="/projects/:slug">
                <Project />
            </Route>
            <Route path="/posts/:slug">
                <Project dataKey="posts" dataPath="posts/posts.json" />
            </Route>
            <Route exact path="/">
                <Frontpage />
            </Route>
        </HashRouter>);
}

main();
