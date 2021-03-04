import '../node_modules/graphiql/graphiql.css';

import GraphiQL from 'graphiql';
import React, { Component } from 'react';

interface IParams {
  variables?: any;
  url?: string;
  token?: string;
  query?: string;
}

interface IAppState {
  url: string;
  token: string;
  query: string;
  variables: any;
}

class App extends Component<any, IAppState> {
  oldFactory;
  oldUrl;
  oldToken;

  constructor(props) {
    super(props);

    const search = window.location.search;
    const parameters: IParams = {};
    search
      .substr(1)
      .split('&')
      .forEach(function (entry) {
        const eq = entry.indexOf('=');
        if (eq >= 0) {
          parameters[
            decodeURIComponent(entry.slice(0, eq))
          ] = decodeURIComponent(entry.slice(eq + 1));
        }
      });

    if (parameters.variables) {
      try {
        parameters.variables = JSON.stringify(
          JSON.parse(parameters.variables),
          null,
          2
        );
      } catch (e) {}
    }

    this.state = {
      url: parameters.url,
      token: parameters.token,
      query: parameters.query,
      variables: parameters.variables
    };
    this.updateURL = this.updateURL.bind(this);
  }

  onEditQuery(newQuery) {
    this.setState({ query: newQuery }, this.updateURL);
  }

  onEditVariables(newVariables) {
    this.setState({ variables: newVariables }, this.updateURL);
  }

  onUrlChange(e) {
    this.setState({ url: e.target.value }, this.updateURL);
  }

  onTokenChange(e) {
    this.setState({ token: e.target.value }, this.updateURL);
  }

  updateURL() {
    const encodedState = Object.keys(this.state)
      .map(
        key =>
          `${encodeURIComponent(key)}=${encodeURIComponent(this.state[key])}`
      )
      .join('&');
    const newSearch = `?${encodedState}`;
    window.history.replaceState(null, null, newSearch);
  }

  fetcherFactory(url, token) {
    if (this.oldFactory && url === this.oldUrl && token === this.oldToken) {
      return this.oldFactory;
    }
    this.oldUrl = url;
    this.oldToken = token;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    if (token && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    this.oldFactory = function graphQLFetcher(graphQLParams) {
      return fetch(`${url}/graphql`, {
        method: 'post',
        headers,
        body: JSON.stringify(graphQLParams)
      }).then(response => response.json());
    };
    return this.oldFactory;
  }

  render() {
    return (
      <div className="app">
        <div className="header">
          <div>
            <img
              className="aon-logo"
              src="https://assets.aoncyberplatform.com/aon-logo-mark-white.svg"
              alt="Logo"
            />
          </div>
          <div>
            <label>
              url
              <input
                type="text"
                id="url-input"
                onChange={this.onUrlChange.bind(this)}
                value={this.state.url}
              />
            </label>
            <label>
              token
              <input
                type="text"
                id="token-input"
                onChange={this.onTokenChange.bind(this)}
                value={this.state.token}
              />
            </label>
          </div>
        </div>
        <div className="body" key={this.state.url}>
          <GraphiQL
            fetcher={this.fetcherFactory(this.state.url, this.state.token)}
            query={this.state.query}
            variables={this.state.variables}
            onEditQuery={this.onEditQuery.bind(this)}
            onEditVariables={this.onEditVariables.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default App;
