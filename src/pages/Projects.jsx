import React from "react"
import { PiArrowLeftBold } from "react-icons/pi";
const { Page } = require("./Page")
import { Link } from "react-router-dom";
import { TagsControl } from "@/ui/TagsControl";
import { DataContext } from "@/js/DataContext";

export class Projects extends Page
{
    constructor(props)
    {
        super(props);

        this.state = {
            ...this.state,
            projects: [],
            filters: []
        }
    }

    async componentDidMount()
    {
        this.getJson("projects", "projects/projects.json");
    }

    filterFunc(x)
    {
        if(!this.state.filters.length)
            return true;

        return x.tags.some(x => this.state.filters.includes(x));
    }

    getProjectGridItems()
    {
        if (!this.state.loaded || !this.state.projects.length)
            return <div className="loader"></div>

        return this.state.projects.filter(this.filterFunc.bind(this)).map((x, i) =>
        {
            return <div className="cell" key={i}>
                <img src="https://picsum.photos/400/300?1" />
                <h1>{x.name}</h1>
                <h2>{x.date}</h2>
                <p>{x.description}</p>
                <div className="tags">
                    {x.tags.map((y, j) => <span key={i + "-" + y}>{y}</span>)}
                </div>
            </div>
        });
    }

    onFiltersChanged(filters)
    {
        this.setState({ filters });
    }

    render()
    {
        const data = {
            projects: this.state.projects
        };

        return <DataContext.Provider value={data}>
            <main className="projects">
            <header>
                <Link to="/">
                    <button><PiArrowLeftBold/></button>
                </Link>
                <h1 className="title-font">Projects</h1>
                <aside>
                    <TagsControl onFiltersChanged={this.onFiltersChanged.bind(this)} />
                </aside>
            </header>
            <div className="content">
                <div className="picture-grid">
                    {this.getProjectGridItems()}
                </div>
            </div>
        </main>
        </DataContext.Provider>;
    }

}