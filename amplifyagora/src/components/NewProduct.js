import React from "react";
import { PhotoPicker } from 'aws-amplify-react';
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";

const initialState = {
  description: '',
  price: '',
  shipped: false,
  imagePreview: '',
  image: ''
};
class NewProduct extends React.Component {
  state = { ...initialState };

  handleAddProduct = async () => {
    try {
      console.log(this.state);
      this.setState({ ...initialState })
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const { 
      description,
      price,
      image,
      shipped, 
      imagePreview 
    } = this.state;
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
                value={description}
                onChange={description => this.setState({ description }) }/>
            </Form.Item>

            <Form.Item label="Set product price">
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
            { imagePreview ? (
              <img 
                className="image-preview"
                src={imagePreview}
                alt="product preview" />
            ) : null }
            <PhotoPicker
              title="Product Image"
              preview="hidden"
              onLoad={ url => this.setState({ imagePreview: url })}
              onPick={ image => this.setState({ image })}
              theme={{
                formContainer: {
                  margin: 0,
                  padding: '0.8em'
                },
                formSection: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                sectionHeader:  {
                  padding: '0.2em',
                  color: 'var(--darkAmazonOrange)'
                },
                sectionBody: {
                  margin: 2,
                  width: '250px'
                },
                photoPickerButton: {
                  display: 'none'
                }
              }} />
            <Form.Item>
              <Button 
                disabled={!image || !description || !price}
                type="primary" 
                onClick={this.handleAddProduct}>Add Product</Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      
    )
  }
}

export default NewProduct;
