//
import '@/styles/index.sass'

//Import components
import { Frontpage } from "@/pages/Frontpage.jsx";
import { Projects } from "@/pages/Projects.jsx";
import Project from "@/pages/Project.jsx";

//Import react
import React from 'react';
import { HashRouter, Switch, Link, Route, Redirect } from 'react-router-dom';
import { createRoot } from "react-dom/client";

import { DataContext } from '@/js/DataContext.js';
import { FaArrowRight } from 'react-icons/fa';

//----------

function get404()
{
    return <main className="pg-404">
        <div className="jumbo">
            <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnl1NHprcnV3YTU1a3cxeXJuNGtuZXR6Ym0zcG51ejl5MHpnbDl0MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RhEvCHIeZAZ6E/giphy.webp"/>
        </div>
        
        <div className="pg-404-notice">
            <h1>404</h1>
            <h2>Well, looks like you done broke it 💀</h2>
            <Link to="/">
                <button>Return to safety <FaArrowRight/> </button>
            </Link>
        </div>
    </main>
}

async function main()
{
    //Create root
    const root = createRoot(document.getElementById("root"));

    root.render(
        <HashRouter>
            <Switch>
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
                <Route>
                    {get404()}
                </Route>
            </Switch>
        </HashRouter>);
}

main();
