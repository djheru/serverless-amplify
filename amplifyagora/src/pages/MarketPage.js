import React from "react";
import {API, graphqlOperation } from 'aws-amplify';
import { Link } from 'react-router-dom';
import { Loading, Tabs, Icon } from "element-react";
import {onCreateProduct, onUpdateProduct, onDeleteProduct } from '../graphql/subscriptions';
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';
import { formatProductDate } from '../utils';

export const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products(sortDirection: DESC, limit: 999) {
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
    isMarketOwner: false,
    isEmailVerified: false
  };

  componentDidMount() {
    this.handleGetMarket();

    this.createProductListener = API
      .graphql(graphqlOperation(onCreateProduct))
      .subscribe({
        next: productData => {
          const { value: { data: { onCreateProduct: createdProduct } = {}} = {}} = productData;
          const prevProducts = this.state.market.products.items.filter(({ id }) => id !== createdProduct.id);
          const updatedProducts = [
            createdProduct,
            ...prevProducts
          ];
          const market = { ...this.state.market };
          market.products.items = updatedProducts;
          this.setState({ market });
        }
      });

    this.updateProductListener = API
      .graphql(graphqlOperation(onUpdateProduct))
      .subscribe({
        next: productData => {
          const updatedProduct = productData.value.data.onUpdateProduct;
          const productIndex = this.state.market.products.items.findIndex(({ id }) => updatedProduct.id === id);
          const updatedProducts = [
            ...this.state.market.products.items.slice(0, productIndex),
            updatedProduct,
            ...this.state.market.products.items.slice(productIndex + 1)
          ];
          const market = { ...this.state.market };
          market.products.items = updatedProducts;
          this.setState({ market})
        }
      });

      this.deleteProductListener = API
        .graphql(graphqlOperation(onDeleteProduct))
        .subscribe({
          next: productData => {
            const { value: { data: { onDeleteProduct: deletedProduct } = {}} = {}} = productData;
            const deletedProducts = this.state.market.products.items.filter(({ id }) => id !== deletedProduct.id);
            const market = { ...this.state.market };
            market.products.items = deletedProducts;
            this.setState({ market });
          }
        });
  }

  componentWillUnmount() {
    this.createProductListener.unsubscribe();
    this.updateProductListener.unsubscribe();
    this.deleteProductListener.unsubscribe();
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
        this.checkEmailVerified();
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

  checkEmailVerified = () => {
    const { userAttributes } = this.props;
    if (userAttributes) {
      this.setState({ isEmailVerified: userAttributes.email_verified })
    }
  }

  render() {
    const { market, isLoading, isMarketOwner, isEmailVerified } = this.state;
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
            {formatProductDate(market.createdAt)}
          </span>
        </div>

        <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
          <Tabs.Pane label={(
            <>
              <Icon name="plus" className="icon" /> Add Product
            </>
          )}
          name="1">
            {
              isEmailVerified ? (
                <NewProduct marketId={this.props.marketId}/>
              ) : (
                <Link to="/profile" className="header">Verify your email before adding products</Link>
              )
            }
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
