import React from "react"
import { PiArrowLeftBold } from "react-icons/pi";
const { Page } = require("./Page")


export class Projects extends Page
{
    constructor(props)
    {
        super(props);

        this.state = {
            ...this.state,
            projects: []
        }
    }

    async componentDidMount()
    {
        this.getJson("projects", "projects/projects.json");
    }

    getProjectGridItems()
    {
        if (!this.state.loaded || !this.state.projects.length)
            return <div className="loader"></div>

        return this.state.projects.filter(x => x.showOnFrontpage).map((x, i) =>
        {
            return <div className="cell" key={i}>
                <img src="https://picsum.photos/400/300?1" />
                <h1>{x.name}</h1>
                <p>{x.description}</p>
                <div className="tags">
                    {x.tags.map((y, j) => <span key={i + "-" + y}>{y}</span>)}
                </div>
            </div>
        });
    }

    render()
    {
        return <main className="projects">
            <header>
                <button><PiArrowLeftBold/></button>
                <h1 className="title-font">Projects</h1>
                <aside>
                    Controls
                </aside>
            </header>
            <div className="content">
                <div className="picture-grid">
                    {this.getProjectGridItems()}
                </div>
            </div>
        </main>
    }

}