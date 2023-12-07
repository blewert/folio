import React from "react";
import { Page } from "./Page.jsx";
import { Link, withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PiArrowLeftBold } from "react-icons/pi";

class Project extends Page
{
    constructor(props)
    {
        super(props);

        this.state = {
            ...this.state,
            projects: [],
            project: null,
            mdText: null
        }
    }

    async componentDidMount()
    {
        await this.getJson("projects", "projects/projects.json");

        if(this.state.loadFailed)
            return null;

        const slug = this.props.match?.params?.slug;
        const project = this.state.projects.filter(x => x.slug == slug)?.[0];

        if(!slug || !project)
            return this.setState({ loadFailed: true });

        await this.getText("mdText", project.mdFile);

        this.setState({ project: project });
    }

    failedLoadScreen()
    {
        return <main className="failed-project-load">
            <h1>Couldn't load this project</h1>
            <p>Something went wrong. Click <Link to="/">here</Link> to return to the front page, or press the back button in your browser</p>
        </main>
    }


    render()
    {
        if(this.state.loadFailed)
            return this.failedLoadScreen();

        if(!this.state.project || !this.state.loaded)
            return null;

        const project = this.state.project;

        return <main className="project-post">
            <header>
                <div className="content">
                    <img src="https://picsum.photos/1920/1080?1"/>
                    <div className="top">
                        <span>
                            <button onClick={window.history.back}><PiArrowLeftBold/></button>
                        </span>
                        <h1>{project.name}</h1>
                        <h2>{project.date}</h2>
                    </div>
                    <p>{project.description}</p>
                </div>
            </header>
            <div className="gallery">
                gallery here
            </div>
            <article>
                <ReactMarkdown>{this.state.mdText}</ReactMarkdown>
            </article>
        </main>
    }
}

export default withRouter(Project);