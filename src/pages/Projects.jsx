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

        this.dataKey = this.props?.dataKey || "projects";
        this.dataPath = this.props?.dataPath || "projects/projects.json";

        this.state = {
            ...this.state,
            projects: [],
            filters: [],
            [this.dataKey]: []            
        }

        // this.dataKey = "projects";
        // this.dataPath = "projects/projects.json";
    }

    async componentDidMount()
    {
        // console.log("send " + this.dataPath + " into " + this.dataKey);
        this.getJson(this.dataKey, this.dataPath);
    }

    filterFunc(x)
    {
        if(!this.state.filters.length)
            return true;

        return x.tags.some(x => this.state.filters.includes(x));
    }

    getProjectGridItems()
    {
        // console.log(this.state);

        if (!this.state.loaded || !this.state[this.dataKey]?.length)
            return <div className="loader"></div>

        return this.state[this.dataKey].filter(this.filterFunc.bind(this)).map((x, i) =>
        {
            return <Link to={`/projects/` + x.slug} key={i}>
                <div className="cell" key={i}>
                    <img src={x.headerImage} />
                    <h1>{x.name}</h1>
                    <h2>{x.date}</h2>
                    <p>{x.description}</p>
                    <div className="tags">
                        {x.tags.map((y, j) => <span key={i + "-" + y}>{y}</span>)}
                    </div>
                </div>
            </Link>
        });
    }

    onFiltersChanged(filters)
    {
        this.setState({ filters });
    }

    render()
    {
        const data = {
            [this.dataKey]: this.state[this.dataKey],
            dataKey: this.dataKey
        };

        // console.log(this.state);

        return <DataContext.Provider value={data}>
            <main className="projects">
            <header>
                <Link to="/">
                    <button><PiArrowLeftBold/></button>
                </Link>
                <h1 className="title-font">{this.props.title || "Projects"}</h1>
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