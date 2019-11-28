import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import faCode from '@fortawesome/fontawesome-free-solid/faCode';
import faBook from '@fortawesome/fontawesome-free-solid/faBook';
import faGithub from '@fortawesome/fontawesome-free-brands/faGithub';
import { ExpandableListItem, ListItem } from 'components';
import { classes } from 'common/util';
import { actions } from 'reducers';
import styles from './Navigator.module.scss';

class Navigator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      categoriesOpened: {},
      scratchPaperOpened: true,
      query: '',
    };
  }

  componentDidMount() {
    const { algorithm } = this.props.current;
    if (algorithm) {
      this.toggleCategory(algorithm.categoryKey, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { algorithm } = nextProps.current;
    if (algorithm) {
      this.toggleCategory(algorithm.categoryKey, true);
    }
  }

  toggleCategory(key, categoryOpened = !this.state.categoriesOpened[key]) {
    const categoriesOpened = {
      ...this.state.categoriesOpened,
      [key]: categoryOpened,
    };
    this.setState({ categoriesOpened });
  }

  toggleScratchPaper(scratchPaperOpened = !this.state.scratchPaperOpened) {
    this.setState({ scratchPaperOpened });
  }

  handleChangeQuery(e) {
    const { categories } = this.props.directory;
    const categoriesOpened = {};
    const query = e.target.value;
    categories.forEach(category => {
      if (this.testQuery(category.name) || category.algorithms.find(algorithm => this.testQuery(algorithm.name))) {
        categoriesOpened[category.key] = true;
      }
    });
    this.setState({ categoriesOpened, query });
  }

  testQuery(value) {
    const { query } = this.state;
    const refine = string => string.replace(/-/g, ' ').replace(/[^\w ]/g, '');
    const refinedQuery = refine(query);
    const refinedValue = refine(value);
    return new RegExp(`(^| )${refinedQuery}`, 'i').test(refinedValue) ||
      new RegExp(refinedQuery, 'i').test(refinedValue.split(' ').map(v => v && v[0]).join(''));
  }

  render() {
    const { categoriesOpened, scratchPaperOpened, query } = this.state;
    const { className } = this.props;
    // const { categories, scratchPapers } = this.props.directory;
    const { scratchPapers } = this.props.directory;
    const { algorithm, scratchPaper } = this.props.current;

    const categoryKey = algorithm && algorithm.categoryKey;
    const algorithmKey = algorithm && algorithm.algorithmKey;
    const gistId = scratchPaper && scratchPaper.gistId;
    const categories = [
      {key: "backtracking", name: "Backtracking", algorithms: 
        [
          {key: "hamiltonean-cycles", name: "Hamiltonean Cycles"},
          {key: "n-queens-problem", name: "N-Queens Problem"},
          {key: "sum-of-subsets", name: "Sum of subsets"}
        ] 
      },
      {key: "dynamic-programming", name: "Dynamic Programming", algorithms: 
        [
          {key: "bellman-fords-shortest-path", name: "Bellman-Ford's Shortest Path"},
          {key: "floyd-warshalls-shortest-path", name: "Floyd-Warshall's Shortest Path"},
          {key: "knapsack-problem", name: "Knapsack Problem"}
        ]
      },
      {key: "greedy", name: "Greedy", algorithms: 
        [
          {key: "dijkstras-shortest-path", name: "Dijkstra's Shortest Path"},
          {key: "kruskals-minimum-spanning-tree", name: "Kruskal's Minimum Spanning Tree"},
          {key: "prims-minimum-spanning-tree", name: "Prim's Minimum Spanning Tree"}
        ]
      }
    ];
    return (
      <nav className={classes(styles.navigator, className)}>
        <div className={styles.algorithm_list}>
          {
            categories.map(category => {
              const categoryOpened = categoriesOpened[category.key];
              let algorithms = category.algorithms;
              if (!this.testQuery(category.name)) {
                algorithms = algorithms.filter(algorithm => this.testQuery(algorithm.name));
                if (!algorithms.length) return null;
              }
              return (
                <ExpandableListItem key={category.key} onClick={() => this.toggleCategory(category.key)}
                                    label={category.name}
                                    opened={categoryOpened}>
                  {
                    algorithms.map(algorithm => (
                      <ListItem indent key={algorithm.key}
                                selected={category.key === categoryKey && algorithm.key === algorithmKey}
                                to={`/${category.key}/${algorithm.key}`} label={algorithm.name}/>
                    ))
                  }
                </ExpandableListItem>
              );
            })
          }
        </div>
        <div className={styles.footer}>
          <ExpandableListItem icon={faCode} label="Scratch Paper" onClick={() => this.toggleScratchPaper()}
                              opened={scratchPaperOpened}>
            <ListItem indent label="New ..." to="/scratch-paper/new"/>
            {
              scratchPapers.map(scratchPaper => (
                <ListItem indent key={scratchPaper.key} selected={scratchPaper.key === gistId}
                          to={`/scratch-paper/${scratchPaper.key}`} label={scratchPaper.name}/>
              ))
            }
          </ExpandableListItem>
        </div>
      </nav>
    );
  }
}

export default connect(({ current, directory, env }) => ({ current, directory, env }), actions)(
  Navigator,
);
