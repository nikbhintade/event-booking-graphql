import React, { Component } from 'react'

import authContext from '../context/auth-context';

import Spinner from '../components/spinner/Spinner'
import BookingList from '../components/bookings/BookingList/BookingList';

export class Bookings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            bookings: []
        };

    }

    static contextType = authContext;

    componentDidMount() {
        this.fetchBookings();
    }

    fetchBookings = () => {
        this.setState({
            isLoading: true
        })
        const requestBody = {
            query: `
                    query {
                        bookings {
                            _id
                            createdAt
                            event {
                                _id
                                title
                                date
                            }
                        }
                    }
                `
        }

        const token = this.context.token;
        console.log(token);
        fetch('http://localhost:3000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + token
            }
        })
            .then(response => {
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json()
            }).then(resData => {
                console.log(resData);
                const bookings = resData.data.bookings;

                this.setState({
                    bookings: bookings,
                    isLoading: false
                })

            }).catch(err => {
                console.log(err);

                this.setState({
                    isLoading: true
                })

            })
    }

    deleteBookingHandler = bookingId => {
        this.setState({
            isLoading: true
        })
        const requestBody = {
            query: `
                    mutation {
                        cancelBooking(bookingId: "${bookingId}") {
                            _id
                            title
                        }
                    }
                `
        }

        const token = this.context.token;
        console.log(token);
        fetch('http://localhost:3000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + token
            }
        })
            .then(response => {
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json()
            }).then(resData => {
                console.log(resData);

                this.setState(prevState => {
                    const updatedBookings = prevState.bookings.filter(booking => {
                        return booking._id !== bookingId;
                    });
                    return { bookings: updatedBookings, isLoading: false };
                })

            }).catch(err => {
                console.log(err);

                this.setState({
                    isLoading: true
                })

            })
    };

    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner></Spinner> :
                    <BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
                }
            </React.Fragment>
        )
    }
}

export default Bookings
