const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./merge');

module.exports = { //resolver functions
    //resolvers & commands should have same name
    bookings: async () => {
        try {
            const bookings = await Booking.find().exec();
            return bookings.map(booking => {
                return transformBooking(booking)
            })
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
        return transformBooking(result)
    },

    cancelBooking: async (args) => {
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