const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./merge');

module.exports = { //resolver functions
    //resolvers & commands should have same name
    bookings: async (args, req) => {
        console.log("request", req)
        console.log('Authenticated', req.isAuth)
        if (!req.isAuth) {
            throw new Error('Your not authenticated')
        }
        try {
            const bookings = await Booking.find({ user: req.userId }).exec();
            return bookings.map(booking => {
                return transformBooking(booking)
            })
        } catch (err) {
            throw err;
        }
    },

    bookEvent: async (args, req) => {
        console.log('Authenticated', req.isAuth)
        if (!req.isAuth) {
            throw new Error('Your not authenticated')
        }
        const fetchedEvent = await Event.findOne({ _id: args.eventId }).exec();

        const booking = new Booking({
            user: req.userId,
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result)
    },

    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Your not authenticated')
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            console.log(booking.event._doc);
            const event = transformEvent(booking.event);
            console.log(event)
            await Booking.deleteOne({ _id: args.bookingId }).exec();
            return event;
        } catch (err) {
            throw err;
        }
    },
}