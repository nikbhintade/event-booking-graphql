const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');
const app = express();


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
            return Event.find().then(
                (events) => {
                    return events.map(event => {
                        return { ...event._doc, _id: event.id };
                    });
                }).catch(
                    (err) => {
                        console.log(err);
                        throw err;
                    }
                )

        },
        createEvent: (args) => {
            const input = args.eventInput
            const event = new Event({
                title: input.title,
                description: input.description,
                price: +input.price,
                date: new Date(input.date)
            })
            return event
                .save()
                .then(
                    event => {
                        console.log(event)
                        return { ...event._doc, _id: event.id };
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        throw err;
                    }
                );
        }
    },
    graphiql: true
}))

mongoose.connect(`mongodb+srv://bono-admin:${process.env.MONGO_PASSWORD
    }@cluster0.k21zw.mongodb.net/${process.env.MONGO_DB
    }?retryWrites=true&w=majority`).then(
        () => {
            app.listen(3000);
        }
    ).catch(
        (err) => {
            console.log(err)
        }
    )

