import React from "react";
import { Page } from "./Page.jsx";
import { Link, withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PiArrowLeftBold } from "react-icons/pi";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

class Project extends Page
{
    constructor(props)
    {
        super(props);

        this.dataKey = this.props?.dataKey || "projects";
        this.dataPath = this.props?.dataPath || "projects/projects.json";

        this.state = {
            ...this.state,
            [this.dataKey]: [],
            data: null,
            mdText: null,
            galleryIndex: -1
        }
    }

    async componentDidMount()
    {
        await this.getJson(this.dataKey, this.dataPath);

        if(this.state.loadFailed)
            return null;

        const slug = this.props.match?.params?.slug;
        const data = this.state[this.dataKey].filter(x => x.slug == slug)?.[0];

        if(!slug || !data)
            return this.setState({ loadFailed: true });

        await this.getText("mdText", data.mdFile);

        this.setState({ data });
    }

    failedLoadScreen()
    {
        return <main className="failed-project-load">
            <h1>Couldn't load this item</h1>
            <p>Something went wrong. Click <Link to="/">here</Link> to return to the front page, or press the back button in your browser</p>
        </main>
    }

    getGalleryData()
    {
        return this.state.data.gallery?.map(x => {
            return {
                src: x.image
            }
        });
    }

    galleryClose()
    {
        this.setState({ galleryIndex: -1 });
    }

    getGalleryItems()
    {
        return this.state.data.gallery?.map((x, i) => {
            return <img key={i} onClick={x => this.setState({galleryIndex: i})} src={x.image} title={x.title}/>
        });
    }

    render()
    {
        if(this.state.loadFailed)
            return this.failedLoadScreen();

        if(!this.state.data || !this.state.loaded)
            return null;

        const data = this.state.data;

        return <main className="project-post">
            <header>
                <div className="content">
                    <img src={data.headerImage}/>
                    <div className="top">
                        <span>
                            <button onClick={() => window.history.back()}><PiArrowLeftBold/></button>
                        </span>
                        <h1>{data.name}</h1>
                        <h2>{data.date}</h2>
                    </div>
                    <p>{data.description}</p>
                </div>
            </header>
            <div className="gallery">
                <div className="photos">
                {this.getGalleryItems()}
                </div>
                <Lightbox index={this.state.galleryIndex} open={this.state.galleryIndex > -1} close={this.galleryClose.bind(this)} slides={this.getGalleryData()}/>
            </div>
            <article>
                <ReactMarkdown>{this.state.mdText}</ReactMarkdown>
            </article>
        </main>
    }
}

export default withRouter(Project);