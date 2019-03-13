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
