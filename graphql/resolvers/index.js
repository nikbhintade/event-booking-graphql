const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } }).then(
        events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event.creator)
                }
            })
        }
    ).catch(
        err => {
            throw err
        }
    )
}
const user = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                _id: user.id,
                createEvents: events.bind(this, user._doc.createEvents)
            }
        }).catch(err => {
            throw err
        })
}

module.exports = { //resolver functions
    //resolvers & commands should have same name
    events: () => {
        return Event
            .find()
            .populate('creator')
            .then((events) => {
                return events.map(event => {
                    return {
                        ...event._doc,
                        _id: event.id,
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    };
                });
            })
            .catch(
                (err) => {
                    console.log(err);
                    throw err;
                })

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
                    createdEvent = {
                        ...result._doc,
                        _id: result._doc._id.toString(),
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, result._doc.creator)
                    };
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
}