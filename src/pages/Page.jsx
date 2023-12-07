import React from "react"

export class Page extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            loadFailed: false,
            loadCounter: 0,
            loadExpected: 0,
            loaded: false
        }
    }

    failFast()
    {
        this.setState({ loadFailed: true });
    }

    async getJson(saveKey, url)
    {
        this.setState({ loadExpected: this.state.loadExpected + 1 });
        
        const resp = await fetch(url);
        
        if (resp.status != 200)
        return this.failFast();
        
        const json = await resp.json();
        
        this.setState({
            [saveKey]: json
        });

        const loaded = (this.state.loadCounter + 1) >= this.state.loadExpected;

        await new Promise((res) => this.setState({ loadCounter: this.state.loadCounter + 1, loaded }, res));
    }

    async getText(saveKey, url)
    {
        this.setState({ loadExpected: this.state.loadExpected + 1 });

        const resp = await fetch(url);

        if (resp.status != 200)
            return this.failFast();

        const text = await resp.text();

        this.setState({
            [saveKey]: text
        });

        const loaded = (this.state.loadCounter + 1) >= this.state.loadExpected;

        await new Promise((res) => this.setState({ loadCounter: this.state.loadCounter + 1, loaded }, res));
    }

    setLoaded(value=true)
    {
        this.setState({ loaded: value });
    }
}