const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./merge');

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
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }

    },

    createEvent: async (args, req) => {
        console.log(req.isAuth);
        if (!req.isAuth) {
            throw new Error('Your not authenticated')
        }
        const input = args.eventInput
        const event = new Event({
            title: input.title,
            description: input.description,
            price: +input.price,
            date: dateToString(input.date),
            creator: req.userId
        })
        let createdEvent;

        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch (err) {
            throw err;
        }
    }


}