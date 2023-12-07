//
import '@/styles/index.sass'

//Import components
import { Frontpage } from "@/pages/Frontpage.jsx";

//Import react
import React from 'react';
import { createRoot } from "react-dom/client";


//----------


async function main()
{

    const projectFetch = await fetch("projects/projects.json");
    const projectsData = await projectFetch.json();


    //Create root
    const root = createRoot(document.getElementById("root"));
    root.render(<Frontpage/>);
}

main();
