import React from "react";

import { DataContext } from "@/js/DataContext.js";
import { Page } from './Page.jsx';

import { PiArrowRightBold, PiLinkedinLogoBold, PiGithubLogoBold, PiEnvelopeBold, PiGraduationCapBold, PiBookBold } from "react-icons/pi";
import { FaOrcid, FaEnvelope, FaLinkedin, FaGithub, FaThumbtack } from "react-icons/fa";
import _ from "lodash";
import { Link } from "react-router-dom";

import { motion } from 'framer-motion'

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

        const variants = {
            variants: {
                hidden: {
                    opacity: 0
                },

                show: {
                    opacity: 1,
                    transition: {
                        type: "spring",
                        staggerChildren: 0.1
                    }
                }
            }
        }

        const imgVariant = {
            variants: {
                hidden: {
                    opacity: 0,
                    y: -50
                },

                show: {
                    opacity: 1,
                    y: 0
                }
            }
        };

        const textVariants = {
            variants: {
                hidden: {
                    opacity: 0,
                    x: -20
                },

                show: {
                    opacity: 1,
                    x: 0
                }
            }
        }

        const anims = {
            initial: "hidden",
            whileInView: "show"
        }


        return data.filter(x => x.showOnFrontpage).map((x, i) =>
        {
            return <Link to={`/${path}/` + x.slug}>
                <motion.div {...anims} {...variants} className="cell" key={i}>
                    <div className="pin"><FaThumbtack/></div>
                    <motion.img {...imgVariant} src={x.headerImage} />
                    <motion.h1 {...textVariants}>{x.name}</motion.h1>
                    <motion.p {...textVariants}>{x.description}</motion.p>
                    <div className="tags">
                        {x.tags.map((y, j) => <motion.span {...textVariants} key={i + "-" + y}>{y}</motion.span>)}
                    </div>
                </motion.div>
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

        const anims = {
            initial: "hidden",
            whileInView: "show"
        };

        const variants = {
            variants: {
                hidden: {
                    opacity: 0
                },

                show: {
                    opacity: 1,
                    transition: {
                        type: "spring",
                        staggerChildren: 0.1
                    }
                }
            }
        }

        const titleVariant = {
            variants: {
                hidden: {
                    opacity: 0,
                    x: -30
                },

                show: {
                    opacity: 1,
                    x: 0
                }
            }
        }

        for(var key of keys)
        {
            const items = pubs[key];

            elements.push(<motion.div {...anims} {...variants}>
                <motion.h2 {...titleVariant}>{key}</motion.h2>
                {items.map((x, i) => <motion.div {...titleVariant} className="reference" key={key + "-" + i}>
                    <PiBookBold/> {x}
                </motion.div>)}
            </motion.div>)
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
    
        const bannerAnim = {
            y: [30, 0],
            transition: { type: "spring" }
        };

        return <motion.div animate={bannerAnim} className="banner-info">
            <div className="content">
                Background by <a href={bannerLink} title={`Background by ${bannerUser} on GIPHY`} target="_blank">{bannerUser}</a>
            </div>
        </motion.div>;
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

        const container = {
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.2,
                    type: "spring",
                    staggerDirection: 1
                }
            }
        }

        const item = {
            hidden: { opacity: 0, y: -30, rotate: -2 },
            show: { opacity: 1, y: 0, rotate: 0 }
        }

        const socialItem = {
            hidden: { opacity: 0, x: -30 },
            show: { opacity: 1, x: 0 }
        }

        const text = "Hi there, I'm Ben";

        const animProps = (x, i) => {
            return {

                variants: {
                    hidden: { opacity: 0, y: -20 },
                    show: { opacity: 1, y: 0 }
                },

                transition: {
                    delay: Math.random() * 1.0,
                    duration: 0.5
                }
            }
        }

        const spans = text.split("").map((x, i) => {
            return <motion.span key={i} {...animProps(x, i)}>
                {x}
            </motion.span>
        })

        return <><header>
            <motion.div initial="hidden" whileInView={{opacity: [0, 1]}} transition={{ type: "spring", duration: 4}} className="banner" style={banner?.style}></motion.div>
            
            <motion.aside variants={container} initial="hidden" whileInView="show">
                <motion.h1 variants={item} className="title-font">{spans}</motion.h1>
                <motion.p variants={item}>
                    I'm a Senior Lecturer at <a href="https://staffs.ac.uk/">Staffordshire University</a>, interested in Full-Stack Applications, Node, Unity, Games Development and Virtual Reality.
                </motion.p>
                <motion.p variants={item} className="small">
                    I love low-level stuff, breaking things and other nerdy bits. Play guitar sometimes. Previously Senior Full-stack Dev at <a href="https://lincoln.ac.uk/">University of Lincoln</a>, Dev on <a href="https://ncnr.org.uk/">NCNR</a> projects and Senior Dev at Picselica. My research interests include Virtual Reality, Motion Simulation, Graphics and PCG. I also love UI/UX design and I'm a huge typography nerd.
                </motion.p>
                <div className="socials">
                    <motion.a variants={socialItem} href="https://github.com/blewert/" alt="Github"><FaGithub /></motion.a>
                    <motion.a variants={socialItem} href="https://linkedin/in/benjibus/" alt="Linkedin"><FaLinkedin /></motion.a>
                    <motion.a variants={socialItem} href="mailto:b.williams@staffs.ac.uk" alt="Email"><FaEnvelope /></motion.a>
                    <motion.a variants={socialItem} href="https://orcid.org/0000-0003-4766-9337" alt="OrcID"><FaOrcid /></motion.a>
                </div>
            </motion.aside>
            <figure>
                <motion.img initial="hidden" whileInView={{ opacity: [0, 1], y: [50, 0] }} transition={{ type: "spring", duration: 0.5 }} className="bio-img" src="ben.png" onClick={this.onAvatarClick.bind(this)} />
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

        const variants = {
            hidden: {
                opacity: 0,
                x: -20
            },

            show: {
                opacity: 1,
                x: 0,
                transition: {
                    staggerChildren: 0.2
                }
            }
        }

        return <DataContext.Provider value={data}>
            <main>
                {/* <div className="upper">
                    <img className="avatar" src="ben.png" />
                </div> */}

            {this.getHeader()}

            <article>
                <motion.header variants={variants} initial="hidden" whileInView="show" className="f-start">
                    <motion.h1 variants={variants} className="title-font">Bio</motion.h1>
                        <motion.aside variants={variants}>
                        I'm an academic interested in building software and games. I especially love anything involving computer graphics, full-stack frameworks or low level C++. Building software and fun experiences is my passion.
                    </motion.aside>
                    <Link to="/posts/ben">
                        <motion.button variants={variants} className="more-button">More <PiArrowRightBold/> </motion.button>
                    </Link>
                </motion.header>
            </article>

            <hr/>

            <article>
                <motion.header variants={variants} initial="hidden" whileInView="show">
                    <motion.h1 variants={variants} className="title-font">Pinned Posts</motion.h1>
                    <aside>

                    </aside>
                    <Link to="/blog">
                        <motion.button variants={variants}>
                            Show all {this.state.posts.filter(x => !x?.hide).length} posts <PiArrowRightBold />
                        </motion.button>
                    </Link>
                </motion.header>
                <div variants={variants} initial="hidden" whileInView="show" className="picture-grid">
                    {this.getBlogPostItems()}
                </div>
                <Link to="/blog">
                    <button className="show-all">Show all posts <PiArrowRightBold /></button>
                </Link>
            </article>

            <article>
                <motion.header variants={variants} initial="hidden" whileInView="show">
                    <motion.h1 variants={variants} className="title-font">Pinned Projects</motion.h1>
                    <aside>
                    
                    

                    </aside>
                    <Link to="/projects">
                        <motion.button variants={variants}>
                            Show all {this.state.projects.length} projects <PiArrowRightBold />
                        </motion.button>
                    </Link>
                </motion.header>
                <div variants={variants} initial="hidden" whileInView="show" className="picture-grid">
                   {this.getProjectGridItems()}
                </div>
                <Link to="/projects">
                    <button className="show-all">Show all projects<PiArrowRightBold/></button>
                </Link>
            </article>

                <hr />

            <article>
                <motion.header variants={variants} initial="hidden" whileInView="show">
                    <motion.h1 variants={variants} className="title-font">Publications</motion.h1>
                    <aside>
                    </aside>
                        <a href="https://orcid.org/0000-0003-4766-9337" target="_blank">
                        <motion.button variants={variants}>
                            ORCID <PiArrowRightBold />
                        </motion.button>
                    </a>

                    <a href="https://scholar.google.com/citations?user=o9LBoXQAAAAJ&hl=en" target="_blank">
                        <motion.button variants={variants}>
                            Scholar profile <PiArrowRightBold />
                        </motion.button>
                    </a>
                </motion.header>
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