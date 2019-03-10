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
