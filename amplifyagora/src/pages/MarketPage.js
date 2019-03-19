import React from "react";
import {API, graphqlOperation } from 'aws-amplify';
import { Link } from 'react-router-dom';
import { Loading, Tabs, Icon } from "element-react";
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

export const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products {
      items {
        id
        file {
          bucket
          region
          key
        }
        description
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;

class MarketPage extends React.Component {
  state = {
    market: null,
    isLoading: true,
    isMarketOwner: false
  };

  componentDidMount() {
    this.handleGetMarket();
  }

  handleGetMarket = async () => {
    try {
      const input = {
        id: this.props.marketId
      };
      const result = await API.graphql(graphqlOperation(getMarket, input));
      console.dir(result);
      this.setState({ market: result.data.getMarket, isLoading: false}, () => {
        this.checkMarketOwner();
      });
    } catch (e) {
      console.error(e);
    }
  }

  checkMarketOwner = () => {
    const { user } = this.props;
    const { market } = this.state;
    if (user) {
      const isMarketOwner = user.username === market.owner;
      this.setState({ isMarketOwner });
    }
  }

  render() {
    const { market, isLoading, isMarketOwner } = this.state;
    console.dir(this.state)
    return (isLoading) ? (<Loading fullscreen={true} />) : (
      <>
        <Link className="link" to="/">
          Back to Markets List
        </Link>

        <span className="items-center pt-2">
          <h2 className="mb-mr">{market.name}</h2> - {market.owner}
        </span>

        <div className="items-center pt-2">
          <span style={{ color: 'var(--lightSquidInk', paddingBottom: '1em'}}>
            <Icon name="date" className="icon" />
            {market.createdAt}
          </span>
        </div>

        <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
          <Tabs.Pane label={(
            <>
              <Icon name="plus" className="icon" /> Add Product
            </>
          )}
          name="1">
            <NewProduct marketId={this.props.marketId}/>
          </Tabs.Pane>

          <Tabs.Pane  
            label={(
              <>
                <Icon name="menu" className="icon" /> Products ({ market.products.items.length })
              </>
            )}
            name="2">
            <div className="product-list">
              {market.products.items.map(product => (<Product key={product.id} product={product} />))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    )
  }
}

export default MarketPage;
