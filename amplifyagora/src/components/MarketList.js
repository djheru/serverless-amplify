import React from "react";
import { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';
import { Loading, Card, Icon, Tag } from "element-react";
import { Link } from 'react-router-dom';
import { listMarkets } from '../graphql/queries';
import Error from './Error';

const MarketList = () => {
  return (
    <Connect 
      query={graphqlOperation(listMarkets)}>
      {({ data, loading, errors}) => {
        if (errors.length) {
          return <Error errors={errors} />
        }
        if (loading || !data.listMarkets) {
          return <Loading fullscreen={true}/>
        }

        console.log(data.listMarkets);

        return (
          <>
          <h2 className="header">
            <img src="https://icon.now.sh/store_mall_directory/527FFF" alt="heading" className="large-icon" />
            Markets
          </h2>
          {
            data.listMarkets.items.map(market => (
              <div className="my-2" key={market.id}>
                <Card
                  bodyStyle={{
                    padding: '0.8em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                  <div>
                    <span className="flex">
                      <Link className="link" to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: 'var(--darkAmazonOrange)' }}>
                        {market.products && market.products.items ? market.products.items.length : 0}
                      </span>
                      <img src="https://icon.now.sh/shopping_cart/f60" alt="shopping cart" />
                    </span>
                    <div style={{ color: "var(--lightSquidInk)"}}>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags && market.tags.map(tag => (
                      <Tag key={tag} type="danger" className="mx-1">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  </Card>
              </div>
            ))
          }
          </>
        )
      }}
    </Connect>
  );
};

export default MarketList;
