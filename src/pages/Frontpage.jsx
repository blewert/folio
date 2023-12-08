import React from "react";

import { DataContext } from "@/js/DataContext.js";
import { Page } from './Page.jsx';

import { PiArrowRightBold, PiLinkedinLogoBold, PiGithubLogoBold, PiEnvelopeBold, PiGraduationCapBold, PiBookBold } from "react-icons/pi";
import { FaOrcid, FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";
import _ from "lodash";
import { Link } from "react-router-dom";

export class Frontpage extends Page
{
    constructor(props)
    {
        super(props);

        this.state = {
            ...this.state,
            projects: [],
            publications: [],
            posts: []
        }
    }
    
    async componentDidMount()
    {
        this.getJson("projects", "projects/projects.json");
        this.getJson("publications", "publications.json");
        this.getJson("posts", "posts/posts.json");
    }

    getPictureGrid(data, path)
    {
        if(!this.state.loaded || !data.length)
            return <div className="loader"></div>

        return data.filter(x => x.showOnFrontpage).map((x, i) =>
        {
            return <Link to={`/${path}/` + x.slug}>
                <div className="cell" key={i}>
                    <img src="https://picsum.photos/400/300?1" />
                    <h1>{x.name}</h1>
                    <p>{x.description}</p>
                    <div className="tags">
                        {x.tags.map((y, j) => <span key={i + "-" + y}>{y}</span>)}
                    </div>
                </div>
            </Link>
        })
    }

    getBlogPostItems()
    {
        return this.getPictureGrid(this.state.posts, "posts");
    }

    getProjectGridItems()
    {
        return this.getPictureGrid(this.state.projects, "projects");
    }

    getPublicationsList()
    {
        if(!this.state.loaded || !Object.keys(this.state.publications).length)
            return <div className="loader"></div>

        let elements = [];

        const pubs = this.state.publications;
        const keys = Object.keys(pubs).sort().reverse();

        for(var key of keys)
        {
            const items = pubs[key];

            elements.push(<div>
                <h2>{key}</h2>
                {items.map((x, i) => <div className="reference" key={key + "-" + i}>
                    <PiBookBold/> {x}
                </div>)}
            </div>)
        }

        return elements;
    }

    getHeader()
    {
        return <header>
            <aside>
                <h1 className="title-font">Hi there, I'm Ben</h1>
                <p>I'm a Senior Lecturer at <a href="https://staffs.ac.uk/">Staffordshire University</a>, interested in Full-Stack Applications, Node, Unity, Games Development and Virtual Reality.
                </p>
                <p className="small">I love low-level stuff, breaking things and other nerdy bits. Play guitar sometimes. Previously Senior Full-stack Dev at <a href="https://lincoln.ac.uk/">University of Lincoln</a>, Dev on <a href="https://ncnr.org.uk/">NCNR</a> projects and Senior Dev at Picselica. My research interests include Virtual Reality, Motion Simulation, Graphics and PCG. I also love UI/UX design and I'm a huge typography nerd.</p>
                <div className="socials">
                    <a href="https://github.com/blewert/" alt="Github"><FaGithub /></a>
                    <a href="https://linkedin/in/benjibus/" alt="Linkedin"><FaLinkedin /></a>
                    <a href="mailto:b.williams@staffs.ac.uk" alt="Email"><FaEnvelope /></a>
                    <a href="https://orcid.org/0000-0003-4766-9337" alt="OrcID"><FaOrcid /></a>
                </div>
            </aside>
            <figure>
                <img src="2039944.png" />
            </figure>
        </header>
    }

    render()
    {
        const data = {
            projects: this.state.projects,
            publications: this.state.publications
        };

        return <DataContext.Provider value={data}>
            <main>
            {this.getHeader()}

            <article>
                <header className="f-start">
                    <h1 className="title-font">Bio</h1>
                    <aside>
                        I'm an academic interested in building software and games. I especially love anything involving computer graphics, full-stack frameworks or low level C++. Building software and fun experiences is my passion.
                    </aside>
                </header>
            </article>

            <article>
                <header>
                    <h1 className="title-font">Projects</h1>
                    <aside>

                    </aside>
                    <Link to="/projects">
                        <button>
                            Show all {this.state.projects.length} projects <PiArrowRightBold />
                        </button>
                    </Link>
                </header>
                <div className="picture-grid">
                    {this.getProjectGridItems()}

                </div>
            </article>

            <article>
                <header>
                    <h1 className="title-font">Ramblings</h1>
                    <aside>

                    </aside>
                    <Link to="/blog">
                        <button>
                            Show all {this.state.posts.length} posts <PiArrowRightBold/>
                        </button>
                    </Link>
                </header>
                <div className="picture-grid">
                    {this.getBlogPostItems()}
                </div>
            </article>

            <article>
                <header>
                    <h1 className="title-font">Publications</h1>
                    <aside>
                    </aside>
                    <a href="https://scholar.google.com/citations?user=o9LBoXQAAAAJ&hl=en">
                        <button>
                            Scholar profile <PiArrowRightBold />
                        </button>
                    </a>
                </header>
                <div className="references">
                    {this.getPublicationsList()}
                </div>
            </article>
        </main>
        </DataContext.Provider>
    }
}