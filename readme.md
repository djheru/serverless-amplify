# Serverless apps with Amplify

## Setup 

`npm i -g @aws-amplify/cli`
`npx create-react-app amplify-notetaker && cd amplify-notetaker`
`amplify configure` - creates new IAM user
`amplify init` - asks questions and builds a stack
`amplify add api` - answer questions
`amplify push` - Updates the cloudformation stack, generates mutations and queries
`npm i aws-amplify aws-amplify-react` - Client for amplify 

Add withAuthenticator HOC to App, create user and log in

`amplify console -> auth` - Opens a browser window with details about users, etc
  - Can also modify auth settings for required fields and validation options

`amplify console -> api -> graphql` - Launches graphiql
  - Log in with user pools
  - Log in with client id -> `aws_user_pools_web_client_id`
  - Get user/pw for a registered user
  - Log in
  - Do a mutation

- `createNote` mutation

```
mutation {
  createNote(input: { note: "ohai!"}) {
    id
    note
  }
}
```

```
# response
{
  "data": {
    "createNote": {
      "id": "6284657a-0c50-4416-92d8-d6df0eab6566",
      "note": "ohai!"
    }
  }
}
```

- `listNotes` query

```
query {
  listNotes {
    items{
      note
      id
    }
  }
}
```

```
#response
{
  "data": {
    "listNotes": {
      "items": [
        {
          "note": "ohai!",
          "id": "2a638159-b384-450e-bbae-f51c80156794"
        },
        {
          "note": "IT ME!",
          "id": "38eefbb7-3dd6-4d55-acd0-1be4397023a8"
        },
        {
          "note": "lol wut",
          "id": "00f1ae36-29d8-48c1-99e3-f8dd64b2b98b"
        },
        {
          "note": "harry butts",
          "id": "b8426bcf-005d-4a2b-8264-6337ede772e2"
        }
      ]
    }
  }
}
```

`amplify update api -> GraphQL -> Amazon Cognito User Pool` - Update the Note model to use the new @auth directive
`amplify push` - Push the changes by regenerating code and redeploying the updated stack
Output:

```
Current Environment: dev

| Category | Resource name    | Operation | Provider plugin   |
| -------- | ---------------- | --------- | ----------------- |
| Api      | amplifynotetaker | Update    | awscloudformation |
| Auth     | cognito78dcb95b  | No Change | awscloudformation |
? Are you sure you want to continue? Yes

GraphQL schema compiled successfully.
Edit your schema at /Users/philipdamra/Workspace/_sandbox/serverless-amplify/amplify-notetaker/amplify/backend/api/amplifynotetaker/schema.graphql or place .graphql files in a directory at /Users/philipdamra/Workspace/_sandbox/serverless-amplify/amplify-notetaker/amplify/backend/api/amplifynotetaker/schema
? Do you want to update code for your updated GraphQL API Yes
? Do you want to generate GraphQL statements (queries, mutations and subscription) based on your schema types? This will
 overwrite your current graphql queries, mutations and subscriptions Yes
⠏ Updating resources in the cloud. This may take a few minutes...
```

`amplify add hosting -> DEV or PROD` - Sets up hosting via S3. If DEV, it's http, if PROD it's HTTPS and CloudFront
`amplify publish` -> push it up
`amplify status`

## Amplify Agora

- Clone starter repo: https://github.com/reedbarger/amplifyagora.git
- `amplify init` - Answer questions
- `amplify add api` - Generates boilerplate queries, mutations, subscriptions, schema

```
type Market @model @searchable { // @searchable creates an elasticsearch-based model
  id: ID!
  name: String!
  products: [Product] @connection(name: "MarketProducts", sortField: "createdAt") // Setup bidirectional relationship between Market and Product
  tags: [String]
  owner: String!
  createdAt: String
}

type Product @model @auth(rules: [{ allow: owner, identityField: "sub" }]) { // only allow owner to update
  id: ID!
  description: String!
  file: S3Object!
  market: Market @connection(name: "MarketProducts") // other end of the bidirectional relatinship
  price: Float!
  shipped: Boolean!
  owner: String
  createdAt: String
}

type S3Object {
  bucket: String!
  region: String!
  key: String!
}

type User 
@model(
  queries: { get: "getUser"}, // limit the queries that can be invoked
  mutations: { create: "registerUser", update: "updateUser" }, // limit the mutations, renaming the create mutation to registerUser
  subscriptions: null
) {
  id: ID!
  username: String!
  email: String!
  registered: Boolean
  orders: [Order] @connection(name: "UserOrders", sortField: "createdAt")
}

type Order 
@model(
  queries: null,
  mutations: { create: "createOrder" },
  subscriptions: null
){
  id: ID!
  product: Product @connection
  user: User @connection(name: "UserOrders")
  shippingAddress: ShippingAddress
  createdAt: String
}

type ShippingAddress {
  city: String!
  country: String!
  address_line1: String!
  address_state: String!
  address_zip: String!
}
```

- `amplify push` - Builds the API 

### Elasticsearch queries

`amplify console api`

```
{
  searchMarkets(filter:{
    or: [
      {name: { match: "Zippy"}},
      {owner:{ match:"Zippy"}},
      {tags:{match: "Zippy"}}
    ]
  }) {
    items {
      id
      name
      owner
    }
  }
}
```