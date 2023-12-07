import React from "react";
import { PiArrowRightBold, PiLinkedinLogoBold, PiGithubLogoBold, PiEnvelopeBold } from "react-icons/pi";
import { FaOrcid, FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";

export class Frontpage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            projects: [],
            publications: [],
            loadFailed: false,
            loaded: false
        }
    }

    failFast()
    {
        this.setState({ loadFailed: true });    
    }

    async getProjectsJSON()
    {
        const projectsResp = await fetch("projects/projects.json");

        if (projectsResp.status != 200)
            return this.failFast();

        const projectsJson = await projectsResp.json();

        this.setState({
            projects: projectsJson.filter(x => x.showOnFrontpage),
            loaded: true
        });
    }
    
    async componentDidMount()
    {
        this.getProjectsJSON();
    }

    getProjectGridItems()
    {
        if(!this.state.loaded || !this.state.projects.length)
            return <div className="loader"></div>

        return this.state.projects.map((x, i) =>
        {
            return <div className="cell" key={i}>
                <img src="https://picsum.photos/400/300?1" />
                <h1>{x.name}</h1>
                <p>{x.description}</p>
                <div className="tags">
                    {x.tags.map((y, j) => <span key={y}>{y}</span>)}
                </div>
            </div>
        });
    }

    render()
    {
        return <main>
            <header>
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
                    <button>
                        Show all {this.state.projects.length} projects <PiArrowRightBold />
                    </button>
                </header>
                <div className="picture-grid">
                    {this.getProjectGridItems()}

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

                    <div>
                        <h2>2023</h2>
                        <div className="reference">Williams, B., 2023. Towards a communication protocol for motion simulators in virtual reality. Animex Research and Innovation Conference 2023.</div>
                    </div>

                    <div>
                        <h2>2021</h2>
                        <div className="reference">Roe, C., Lowe, M., Williams, B. and Miller, C., 2021. Public perception of SARS-CoV-2 vaccinations on social media: Questionnaire and sentiment analysis. International Journal of Environmental Research and Public Health, 18(24), p.13028.</div>
                        <div className="reference">Williams, B. and Headleand, C.J., 2021. Recreational Motion Simulation: A New Frontier for Virtual Worlds Research.</div>
                        <div className="reference">Headleand, C.J., Davies, B. and Williams, B., 2021. Adi's Maze and the Research Arcade: A Long-term Study on the Impact of Gendered Representation on Player Preferences.</div>
                        <div className="reference">Headleand, C.J., Davies, B., Threlfall, D. and Williams, B., 2021. The University on Lincoln Island: Reimagining a University Campus as a Role-Playing Video Game.</div>
                    </div>

                    <div>
                        <h2>2020</h2>
                        <div className="reference">Williams, B., Garton, A.E. and Headleand, C.J., 2020, September. Exploring visuo-haptic feedback congruency in virtual reality. In 2020 International Conference on Cyberworlds (CW) (pp. 102-109). IEEE.</div>
                        <div className="reference">Williams, B., Ritsos, P.D. and Headleand, C., 2020. Virtual forestry generation: Evaluating models for tree placement in games. Computers, 9(1), p.20.</div>
                        <div className="reference">Headleand, C., Williams, B., Holopainen, J. and Gilliam, M., 2020. A Gesture Recognition Model for Virtual Reality Motion Controllers.</div>
                    </div>

                    <div>
                        <h2>2019</h2>
                        <div className="reference">Harrington, J., Williams B. and Headleand, C., 2019. A somatic approach to combating cybersickness utilising airflow feedback.</div>
                        <div className="reference">Williams, B. and Headleand, C., 2019. Evaluating Models for Virtual Forestry Generation and Tree Placement in Games.</div>
                    </div>

                    <div>
                        <h2>2018</h2>
                        <div className="reference">Gerling, K., Hicks, K., Buttrick, L., Headleand, C., Williams, B., Hall, J., Tang, K., Geurts, L. and Chen, W., 2018, October. Potential and limitations of playful technology to support infant feeding. In Proceedings of the 2018 Annual Symposium on Computer-Human Interaction in Play Companion Extended Abstracts (pp. 431-437).</div>
                    </div>

                    <div>
                        <h2>2017</h2>
                        <div className="reference">Hall, J.A., Williams, B. and Headleand, C.J., 2017, September. Artificial folklore for simulated religions. In 2017 International Conference on Cyberworlds (CW) (pp. 229-232). IEEE.</div>
                        <div className="reference">Williams, B. and Headleand, C.J., 2017, September. A time-line approach for the generation of simulated settlements. In 2017 International Conference on Cyberworlds (CW) (pp. 134-141). IEEE.</div>
                    </div>

                    <div>
                        <h2>2016</h2>
                        <div className="reference">Headleand, C.J., Jackson, J., Williams, B., Priday, L., Teahan, W.J. and Ap Cenydd, L., 2016. How the perceived identity of a npc companion influences player behavior. Transactions on Computational Science XXVIII: Special Issue on Cyberworlds and Cybersecurity, pp.88-107.</div>
                        <div className="reference">Williams, B., Jackson, J., Hall, J. and Headleand, C.J., 2018. Modular Games AI Benchmark. In Artificial Life and Intelligent Agents: Second International Symposium, ALIA 2016, Birmingham, UK, June 14-15, 2016, Revised Selected Papers 2 (pp. 138-142). Springer International Publishing.</div>
                    </div>
                </div>
            </article>


        </main>
    }
}