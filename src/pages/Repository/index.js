import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Container from '../../components/Container';
import api from '../../services/api';

import {
  Loading,
  Owner,
  Filter,
  IssueList,
  Pagination,
  Button,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    params: {
      page: 1,
      state: 'all',
      per_page: 5,
    },
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const { params } = this.state;
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params,
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  componentDidUpdate(prevProps, PrevState) {
    const { page, params } = this.state;
    if (PrevState.page !== page || PrevState.params !== params) {
      this.handlePage();
    }
  }

  handleFilterChange = async e => {
    const { params } = this.state;
    this.setState({ params: { ...params, state: e.target.value } });
  };

  handlePage = async () => {
    const { params } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params,
    });
    this.setState({ issues: issues.data });
  };

  handlePreviousPageChange = async () => {
    const { params } = this.state;
    if (params.page > 1) {
      this.setState({ params: { ...params, page: params.page - 1 } });
    }
  };

  handleNextPageChange = async () => {
    const { params } = this.state;
    this.setState({ params: { ...params, page: params.page + 1 } });
  };

  render() {
    const { repository, issues, loading, params } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <select onChange={this.handleFilterChange} name="filter">
            <option value="all">all</option>
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
        </Filter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <Button
            type="button"
            onClick={this.handlePreviousPageChange}
            page={params.page <= 1}
          >
            Anterior
          </Button>
          <Button type="button" onClick={this.handleNextPageChange}>
            Próximo
          </Button>
        </Pagination>
      </Container>
    );
  }
}
