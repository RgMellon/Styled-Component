import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

import { Link } from 'react-router-dom';
import {
  Loading,
  Owner,
  IssueList,
  FiltroIssues,
  ButtonsPaginate,
  HeaderIssue,
} from './styles';

import Container from '../../components/Container';
import api from '../../services/api';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repo: {},
    issues: [],
    loading: true,
    stateIssue: 'all',
    repoName: '',
    castigo: false,
    pageNumber: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const name = await decodeURIComponent(match.params.repository);

    await this.setState({ repoName: name });

    this.getReposGitHub();
  }

  // eslint-disable-next-line react/sort-comp
  getReposGitHub = async () => {
    const { repoName, stateIssue, pageNumber } = this.state;

    try {
      const [repo, issues] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: stateIssue,
            per_page: 5,
            page: pageNumber,
          },
        }),
      ]);

      this.setState({ repo: repo.data, issues: issues.data, loading: false });
    } catch (e) {
      this.setState({ castigo: true });
    }
  };

  componentDidUpdate(_, prevState) {
    const { issues } = this.state;

    if (prevState.issues !== issues) {
      this.getReposGitHub();
    }
  }

  handleChange = async event => {
    await this.setState({ stateIssue: event.target.value });
  };

  handlePaginate = async value => {
    const { pageNumber } = this.state;
    await this.setState({
      pageNumber: value === 'back' ? pageNumber - 1 : pageNumber + 1,
    });

    this.getReposGitHub();
  };

  render() {
    const { repo, issues, loading, stateIssue, castigo } = this.state;

    if (loading && !castigo) {
      return <Loading> Carregando ...</Loading>;
    }

    if (castigo) {
      const pStyle = {
        position: 'absolute',
        left: '25%',
        top: '10%',
        width: '800px',
      };

      return (
        <img
          style={pStyle}
          src="https://i.ytimg.com/vi/GwcoDU74GyI/maxresdefault.jpg"
          alt=""
        />
      );
    }

    return (
      <Container>
        <Owner>
          <Link to="/"> Voltar ao repositórios </Link>
          <img src={repo.owner.avatar_url} alt={repo.owner.login} />
          <h1> {repo.name}</h1>
          <p> {repo.description}</p>
        </Owner>

        <IssueList>
          <HeaderIssue>
            <FiltroIssues value={stateIssue} onChange={this.handleChange}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="all">All</option>
            </FiltroIssues>

            <ButtonsPaginate>
              <button onClick={() => this.handlePaginate('+')}>
                <FaAngleLeft />
              </button>

              <button onClick={() => this.handlePaginate('-')}>
                <FaAngleRight />
              </button>
            </ButtonsPaginate>
          </HeaderIssue>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}> {issue.title} </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}> {label.name}</span>
                  ))}
                </strong>
                <p> {issue.user.login} </p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

export default Repository;
