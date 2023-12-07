import { DataContext } from "@/js/DataContext";
import React from "react";

import { FaFilter } from "react-icons/fa";

class Tag extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    handleClick()
    {
        this.props?.handleClicked(this.props.name);
    }

    render()
    {
        let classes = "tag";

        if(this.props.active)
            classes += " active";

        return <span className={classes} onClick={this.handleClick.bind(this)}>
            {this.props.name}
        </span>
    }
}

export class TagsControl extends React.Component
{
    static contextType = DataContext;

    constructor(props)
    {
        super(props);

        this.allTags = [];
        this.state = {
            filters: [],
            popoutShown: false
        }

        this.containerRef = React.createRef();
    }

    onBodyClicked(event)
    {
        if(!this.containerRef || this.containerRef?.current?.contains(event.target))
            return null;

        this.setState({ popoutShown: false });
    }

    componentDidMount()
    {
        document.body.addEventListener("click", this.onBodyClicked.bind(this));
    }

    componentWillUnmount()
    {
        document.body.removeEventListener("click", this.onBodyClicked.bind(this));
    }

    componentDidUpdate()
    {
        if(!this.context.projects.length)
            return null;

        const tags = this.context.projects.map(x => x.tags);

        this.allTags = [ ...new Set(tags.flat()) ];
    }

    getTitle()
    {
        if(this.state.filters.length == 0)
            return <><FaFilter /> Filter by tag</>;
            
        else
            return <><FaFilter /> Filters active ({this.state.filters.length})</>;
    }

    handleFilterClick(name)
    {
        let filters = this.state.filters;
        const activeFilter = filters.includes(name);

        if(activeFilter)
            filters = filters.filter(x => x != name);
        else
            filters.push(name);

        this.props?.onFiltersChanged(filters);
        this.setState({ filters });
    }

    handlePopoutClick(event)
    {
        if(event.target.className != "tags-control")
            return;

        this.setState({ popoutShown: !this.state.popoutShown });
    }

    getAllFilters()
    {
        const state = this.state;
        const ctx = this;

        return this.allTags.map((x, i) => {
            if(state.filters.includes(x))
                return <Tag key={i} name={x} handleClicked={ctx.handleFilterClick.bind(ctx)} active/>
            else
                return <Tag key={i} name={x} handleClicked={ctx.handleFilterClick.bind(ctx)} />
        })
    }

    renderPopout()
    {
        if(!this.state.popoutShown)
            return null;

        return <div className="popout">
            <h3>Filters ({this.state.filters.length})</h3>
            <div className="tags">
                {this.getAllFilters()}
            </div>
        </div>
    }

    render()
    {
        return <div className="tags-control" ref={this.containerRef}  onClick={this.handlePopoutClick.bind(this)}>
            {this.getTitle()}
            {this.renderPopout()}
        </div>
    }
}