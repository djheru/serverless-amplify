import React from "react";
import { PhotoPicker } from 'aws-amplify-react';
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";

class NewProduct extends React.Component {
  state = {
    description: '',
    price: '',
    shipped: false
  };

  handleAddProduct = async () => {
    try {
      console.log(this.state);
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
      <div className="flex-center">
        <h2 className="header">Add New Product</h2>
        <div>
          <Form className="market-header">
            <Form.Item label="Add product description">
              <Input 
                type="text"
                icon="information"
                placeholder="Description"
                onChange={description => this.setState({ description }) }/>
            </Form.Item>

            <Form.Item label="Set product price">
              <Input 
                type="number"
                icon="plus"
                placeholder="Price ($USD)"
                onChange={price => this.setState({ price }) }/>
            </Form.Item>

            <Form.Item label="Is the product shipped or emailed to the customer?">
              <div className="text-center">
                <Radio
                  value="false"
                  checked={this.state.shipped === false}
                  onChange={() => this.setState({ shipped: false })} />
                <Radio
                  value="true"
                  checked={this.state.shipped === true}
                  onChange={() => this.setState({ shipped: true })} />
              </div>
            </Form.Item>
            <PhotoPicker />
            <Form.Item>
              <Button type="primary" onClick={this.handleAddProduct}>Add Product</Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      
    )
  }
}

export default NewProduct;
