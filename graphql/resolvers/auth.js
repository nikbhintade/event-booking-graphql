const bcrypt = require('bcryptjs');

const User = require('../../models/user');

module.exports = { //resolver functions
    //resolvers & commands should have same name
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