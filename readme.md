# Serverless apps with Amplify

## Setup 

`npm i -g @aws-amplify/cli`
`npx create-react-app amplify-notetaker && cd amplify-notetaker`
`amplify configure` - creates new IAM user
`amplify init` - asks questions and builds a stack
`amplify add api` - answer questions
`amplify push` - Updates the cloudformation stack, generates mutations and queries
`npm i aws-amplify aws-amplify-react` - Client for amplify 
