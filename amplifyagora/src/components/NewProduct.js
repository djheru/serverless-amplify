import React from "react";
import { Storage, Auth, API, graphqlOperation } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";
import { createProduct } from '../graphql/mutations';
import aws_exports from '../aws-exports';
import { convertDollarsToCents } from '../utils';

const initialState = {
  description: '',
  price: '',
  shipped: false,
  imagePreview: '',
  image: '',
  isUploading: false,
  percentUploaded: 0
};


class NewProduct extends React.Component {
  state = { ...initialState };

  handleAddProduct = async () => {
    try {
      console.log(this.state);
      this.setState({ isUploading: true });
      const visibility = 'public';
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${this.state.image.name}`;
      const uploadedFile = await Storage.put(filename, this.state.image.file, {
        contentType: this.state.image.type,
        progressCallback: progress => {
          const percentUploaded = Math.round(progress.loaded / progress.total * 100 );
          this.setState({ percentUploaded })
        }
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region
      };
      const input = {
        productMarketId: this.props.marketId,
        description: this.state.description,
        shipped: this.state.shipped, 
        price: convertDollarsToCents(this.state.price),
        file
      };
      const result = await API.graphql(graphqlOperation(createProduct, { input }));
      console.log('Created product', result)
      Notification({
        title: 'Success',
        message: 'Product successfully created',
        type: 'success'
      })
      this.setState({ ...initialState });
    } catch (e) {
      console.error(e);
      Notification({
        title: 'Success',
        message: 'Error saving product',
        type: 'error'
      })
    }
  }

  render() {
    const { 
      description,
      price,
      image,
      shipped, 
      imagePreview,
      isUploading,
      percentUploaded
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

            { percentUploaded > 0 ? (<Progress type="circle" className="progress" percentage={percentUploaded} status="success" />) : null }

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
                disabled={!image || !description || !price || isUploading}
                loading={isUploading}
                type="primary" 
                onClick={this.handleAddProduct}>{isUploading ? 'Uploading...' : 'Add Product' }</Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      
    )
  }
}

export default NewProduct;
