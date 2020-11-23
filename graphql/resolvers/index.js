const bcrypt = require('bcryptjs');

const Booking = require('../../models/booking');
const Event = require('../../models/event');
const User = require('../../models/user');

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId).exec();
        return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        }
    } catch (err) {
        throw err;
    }
}

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } }).exec()
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        });
    } catch (err) {
        throw err;
    }
}
const user = async userId => {
    console.log(userId)
    try {
        const user = await User.findById(userId).exec();

        return {
            ...user._doc,
            _id: user.id,
            createEvents: events.bind(this, user._doc.createEvents)
        }
    } catch (err) {
        throw err;
    }
}

module.exports = { //resolver functions
    //resolvers & commands should have same name
    bookings: async () => {
        try {
            const bookings = await Booking.find().exec();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
                }
            })
        } catch (err) {
            throw err;
        }
    },

    events: async () => {
        try {
            const events = await Event.find().exec();
            /*
            just await doesn't work you have to use .exec() at the end of query

            explaination: 
            https://stackoverflow.com/questions/53970784/mongoose-promises-documentation-says-queries-are-not-promises

            */
            console.log(events)
            return events.map(event => {
                console.log(event._doc.creator);
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        } catch (err) {
            throw err;
        }

    },

    bookEvent: async (args) => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId }).exec();

        const booking = new Booking({
            user: '5fb92769b1f6d308e8c49c0c',
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString(),
        }
    },

    cancelBooking: async (args) => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            console.log(booking.event._doc);
            const event = {
                ...booking.event._doc,

                creator: user.bind(this, booking.event._doc.creator)
            };
            console.log(event)
            await Booking.deleteOne({ _id: args.bookingId }).exec();
            return event;
        } catch (err) {
            throw err;
        }
    },

    createEvent: async (args) => {
        const input = args.eventInput
        const event = new Event({
            title: input.title,
            description: input.description,
            price: +input.price,
            date: new Date(input.date),
            creator: '5fb92769b1f6d308e8c49c0c'
        })
        let createdEvent;

        try {
            const result = await event.save();
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5fb92769b1f6d308e8c49c0c');
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch (err) {
            throw err;
        }
    },

    createUser: async (args) => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email }).exec();

            if (existingUser) {
                throw new Error('User already exsits')
            }
            const hashPassword = await bcrypt.hash(args.userInput.password, 12)

            const user = new User({
                email: args.userInput.email,
                password: hashPassword
            })
            const result = await user.save();

            return { ...result._doc, password: null, _id: result.id }
        } catch (err) {
            throw err;
        }

    }
}