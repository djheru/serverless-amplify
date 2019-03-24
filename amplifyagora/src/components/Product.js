import React from "react";
import { S3Image } from 'aws-amplify-react';
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { convertCentsToDollars, convertDollarsToCents } from '../utils';
import { API, graphqlOperation } from 'aws-amplify';
import { UserContext } from '../App';
import PayButton from './PayButton';
import { updateProduct, deleteProduct } from "../graphql/mutations";

class Product extends React.Component {
  state = {
    deleteProductDialog: false,
    updateProductDialog: false,
    description: '',
    price: '',
    shipped: false
  };

  handleUpdateProduct = async productId => {
    try {
       this.setState({ updateProductDialog: false});
       const { description, price, shipped } = this.state;
       const input = {
         id: productId,
         description,
         shipped,
         price: convertDollarsToCents(price)
       };

      await API.graphql(graphqlOperation(updateProduct, { input }));
       Notification({
         title: "Success!",
         message: "You did the thing!",
         type: "success"
       });
    } catch (e) {
      console.error(e);
    }
  }

  handleDeleteProduct = async id => {
    try {
      this.setState({ deleteProductDialog: false });
      const input = { id }
      await API.graphql(graphqlOperation(deleteProduct, { input }))
      Notification({
        title: "Success!",
        message: "You did the thing!",
        type: "success"
      });
    } catch (e) {
      console.error(e);
    }
  }
  
  render() {

    const { product } = this.props;
    const { 
      deleteProductDialog,
      updateProductDialog,
      description,
      price,
      shipped,
    } = this.state;

    console.log(product)
    return (
      <UserContext.Consumer>
        {
          ({user}) => {
            const isProductOwner = user && user.attributes.sub === product.owner;
            return (
              <div className="card-container">
                <Card bodyStyle={{ padding: 0, minWidth: '200px'}}>
                  <S3Image 
                    theme={{ photoImg: { maxWidth: '100%', maxHeight: '100%'}}}
                    imgKey={product.file.key} />
                  <div className="card-body">
                    <h3 className="m-0">{product.description}</h3>
                    <div className="items-center">
                      <img 
                        src={`https://icon.now.sh/${product.shipped ? 'markunread_mailbox' : 'mail'}`}
                        alt="shipping icon"
                        className="icon" />
                        {product.shipped ? 'Shipped' : 'Emailed' }
                    </div>
                    <div className="text-right">
                      <span className="mx-1">
                        ${convertCentsToDollars(product.price)}
                      </span>
                      {!isProductOwner ? (
                        <PayButton
                          product={product}
                          user={user} />
                      ) : null }
                    </div>
                  </div>
                </Card>
                <div className="text-center">
                  { isProductOwner ? (
                    <>
                      <Button 
                        type="warning"
                        icon="edit"
                        className="m-1"
                        onClick={() => this.setState({ 
                          updateProductDialog: true,
                          description: product.description,
                          shipped: product.shipped,
                          price: convertCentsToDollars(product.price)
                        })}>
                        </Button>

                        <Popover
                          placement="top"
                          width="160"
                          trigger="click"
                          visible={deleteProductDialog}
                          content={
                            <>
                              <p>Do you really want to delete this product?</p>
                              <div className="text-right">
                                <Button 
                                  size="mini"
                                  type="text"
                                  className="m-1"
                                  onClick={() => this.setState({ deleteProductDialog: false })}>Cancel</Button>
                                <Button 
                                  size="mini"
                                  type="primary"
                                  className="m-1"
                                  onClick={() => this.handleDeleteProduct(product.id)}>Confirm</Button>
                              </div>
                            </>
                          }>
                          <Button 
                            type="danger"
                            icon="delete"
                            className="m-1"
                            onClick={() => this.setState({ deleteProductDialog: true })}/>
                        </Popover>
                    </>
                  ) : null}
                </div>

                <Dialog
                  title="Update Product"
                  size="large"
                  customClass="dialog"
                  visible={updateProductDialog}
                  onCancel={() => this.setState({ updateProductDialog: false })}>
                  <Dialog.Body>
                    <Form labelPosition="top">
                    <Form.Item label="Edit product description">
                      <Input 
                        type="text"
                        icon="information"
                        placeholder="Description"
                        value={description}
                        onChange={description => this.setState({ description }) }/>
                    </Form.Item>

                    <Form.Item label="Edit product price">
                      <Input 
                        type="number"
                        icon="plus"
                        placeholder="Price ($USD)"
                        value={price}
                        onChange={price => this.setState({ price }) }/>
                    </Form.Item>

                    <Form.Item label="Is the product shipped or emailed to the customer?">
                      <div className="text-center">
                        <Radio
                          value="Emailed"
                          checked={shipped === false}
                          onChange={() => this.setState({ shipped: false })} />
                        <Radio
                          value="Shipped"
                          checked={shipped === true}
                          onChange={() => this.setState({ shipped: true })} />
                      </div>
                    </Form.Item>
                    </Form>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button onClick={() => this.setState({ updateProductDialog: false })}>Cancel</Button>
                    <Button type="primary" onClick={() => this.handleUpdateProduct(product.id)}>Update</Button>
                  </Dialog.Footer>
                </Dialog>
              </div>
            );
          }
        }
      </UserContext.Consumer>
    )
  }
}

export default Product;
