import React from "react";

import { DataContext } from "@/js/DataContext.js";
import { Page } from './Page.jsx';

import { PiArrowRightBold, PiLinkedinLogoBold, PiGithubLogoBold, PiEnvelopeBold, PiGraduationCapBold, PiBookBold } from "react-icons/pi";
import { FaOrcid, FaEnvelope, FaLinkedin, FaGithub, FaThumbtack } from "react-icons/fa";
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
            posts: [],
            bgs: []
        }

        this.bgIdx = +window.localStorage["bgIdx"] || 0;
        window.localStorage["bgIdx"] = `${this.bgIdx + 1}`;
    }
    
    async componentDidMount()
    {
        this.getJson("projects", "projects/projects.json");
        this.getJson("publications", "publications.json");
        this.getJson("posts", "posts/posts.json");
        this.getJson("bgs", "gif-bgs/bgs.json");
    }

    getBannerStyle()
    {
        const cssUrlWrap = x => `url("${x}")`;
        console.log(this.bgIndex);

        return {
            backgroundImage: cssUrlWrap("gif-bgs/trippysea.webp")
        }
    }

    getPictureGrid(data, path)
    {
        if(!this.state.loaded || !data.length)
            return <div className="loader"></div>

        return data.filter(x => x.showOnFrontpage).map((x, i) =>
        {
            return <Link to={`/${path}/` + x.slug}>
                <div className="cell" key={i}>
                    <div className="pin"><FaThumbtack/></div>
                    <img src={x.headerImage} />
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

    getBanner()
    {
        if(!this.state.bgs.length)
            return null;


        const urlWrap = x => `url("${x}")`;

        const itemIdx = this.bgIdx % this.state.bgs.length;
        const randItem = this.state.bgs[itemIdx];

        return { 
            item: randItem,
            style: {
                backgroundImage: urlWrap(randItem.url)
            }
        }
    }

    getBannerInfo(banner)
    {
        if(!banner)
            return null;

        const bannerUser = banner?.item?.user;
        const bannerLink = banner?.item?.link;

        return <div className="banner-info">
            <div className="content">
                Background by <a href={bannerLink} title={`Background by ${bannerUser} on GIPHY`} target="_blank">{bannerUser}</a>
            </div>
        </div>;
    }

    onAvatarClick()
    {
        const rndValue = "a" + Math.floor(Math.random() * 10000000);

        const emojiElem = document.createElement("div");
        emojiElem.id = rndValue;

        const texts = ["👋"];

        emojiElem.innerText = texts[Math.floor(Math.random() * texts.length)];
        emojiElem.classList.add("emoji");

        emojiElem.style.top = `${Math.random() * 80}vh`;
        emojiElem.style.left = `${ 10 + Math.random() * 70 }vw`;
        
        document.body.appendChild(emojiElem);

        window.setTimeout(function()
        {
            document.querySelector("#" + rndValue).remove();
        }, 5000)
    }
    
    getHeader()
    {
        let banner = this.getBanner();

        return <><header>
            <div className="banner" style={banner?.style}></div>
            
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
                <img className="bio-img" src="ben.png" onClick={this.onAvatarClick.bind(this)} />
            </figure>
        </header>
        {this.getBannerInfo(banner)}
        </>
    }

    render()
    {
        const data = {
            projects: this.state.projects,
            publications: this.state.publications,
            bgs: this.state.bgs
        };

        return <DataContext.Provider value={data}>
            <main>
                {/* <div className="upper">
                    <img className="avatar" src="ben.png" />
                </div> */}

            {this.getHeader()}

            <article>
                <header className="f-start">
                    <h1 className="title-font">Bio</h1>
                    <aside>
                        I'm an academic interested in building software and games. I especially love anything involving computer graphics, full-stack frameworks or low level C++. Building software and fun experiences is my passion.
                    </aside>
                    <Link to="/posts/ben">
                        <button className="more-button">More <PiArrowRightBold/> </button>
                    </Link>
                </header>
            </article>

            <hr/>

            <article>
                <header>
                    <h1 className="title-font">Pinned Posts</h1>
                    <aside>

                    </aside>
                    <Link to="/blog">
                        <button>
                            Show all {this.state.posts.filter(x => !x?.hide).length} posts <PiArrowRightBold />
                        </button>
                    </Link>
                </header>
                <div className="picture-grid">
                    {this.getBlogPostItems()}
                </div>
                <Link to="/blog">
                    <button className="show-all">Show all posts <PiArrowRightBold /></button>
                </Link>
            </article>

            <article>
                <header>
                    <h1 className="title-font">Pinned Projects</h1>
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
                <Link to="/projects">
                    <button className="show-all">Show all projects<PiArrowRightBold/></button>
                </Link>
            </article>

                <hr />

            <article>
                <header>
                    <h1 className="title-font">Publications</h1>
                    <aside>
                    </aside>
                        <a href="https://orcid.org/0000-0003-4766-9337" target="_blank">
                        <button>
                            ORCID <PiArrowRightBold />
                        </button>
                    </a>

                    <a href="https://scholar.google.com/citations?user=o9LBoXQAAAAJ&hl=en" target="_blank">
                        <button>
                            Scholar profile <PiArrowRightBold />
                        </button>
                    </a>
                </header>
                <div className="references">
                    {this.getPublicationsList()}
                </div>
            </article>
            <footer>
                <div className="wrap">
                    <div className="left">
                        <img src="bw-02.png"/>
                        Design &amp; development by Benjamin Williams<br/>
                        &copy; Benjamin Williams {new Date().getFullYear()}. All rights reserved.<br/>
                    </div>
                    <div className="right">
                        <Link to="/projects">Projects</Link>
                        <Link to="/blog">Blog</Link>
                        <a href="https://staffs.ac.uk/" target="_blank">Staffs</a>
                        <a href="https://benwillia.ms/">Home</a>
                        <a href="javascript:window.scrollTo(0, 0);void(0);">&uarr; Back to top</a>
                    </div>
                </div>
            </footer>
        </main>
        </DataContext.Provider>
    }
}