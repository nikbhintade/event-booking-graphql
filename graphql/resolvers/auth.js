const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    },

    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User doesn\'t exists')
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect.')
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, 'somekeytoauthenticate', {
            expiresIn: '1h'
        });
        console.log("this is token:\n", token)
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, 'somekeytoauthenticate');
        } catch (err) {
            console.log('failed')
        }
        console.log('this is decoded token:\n', decodedToken)
        return {
            userId: user.id,
            token: token,
            tokenExpiration: 1
        };
    }
}