const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = [];

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery{
            events: [Event!]
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: { //resolver functions
        //resolvers & commands should have same name
        events: () => {
            return events;
        },
        createEvent: (args) => {
            const input = args.eventInput
            const event = {
                _id: Math.random().toString(),
                title: input.title,
                description: input.description,
                price: +input.price,
                date: new Date().toISOString()
            }
            events.push(event);
            return event;
        }
    },
    graphiql: true
}))

app.listen(3000);