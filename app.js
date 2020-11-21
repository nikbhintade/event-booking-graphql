const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');
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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String
        }

        type RootQuery{
            events: [Event!]
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
                date: new Date(input.date),
                creator: '5fb92769b1f6d308e8c49c0c'
            })
            let createdEvent;
            return event
                .save()
                .then(
                    result => {
                        createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                        return User.findById('5fb92769b1f6d308e8c49c0c');

                    }
                ).then(user => {
                    if (!user) {
                        throw new Error('User not found.');
                    }
                    user.createEvents.push(event)
                    return user.save()
                }).then(result => {
                    return createdEvent
                }).catch(
                    (err) => {
                        console.log(err);
                        throw err;
                    }
                );
        },

        createUser: (args) => {
            return User.findOne({ email: args.userInput.email })
                .then(user => {
                    if (user) {
                        throw new Error('User already exsits')
                    }
                    return bcrypt.hash(args.userInput.password, 12)
                })
                .then((hashPassword) => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashPassword
                    })
                    return user.save();
                }).then(
                    result => {
                        return { ...result._doc, password: null, _id: result.id }
                    }
                )
                .catch((err) => {
                    throw err;
                })

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

