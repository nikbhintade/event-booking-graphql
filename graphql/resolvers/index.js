const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

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