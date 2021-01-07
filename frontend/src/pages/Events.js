import React, { Component } from 'react'

import Backdrop from '../components/backdrop/Backdrop';
import EventList from '../components/events/EventList/EventList';
import Modal from '../components/modal/Modal';
import Spinner from '../components/spinner/Spinner';
import authContext from '../context/auth-context';

import './Events.css'

export class Events extends Component {
    constructor(props) {
        super(props);
        this.state = {
            creating: false,
            events: [],
            isLoading: false,
            selectedEvent: null
        }
        this.titleRef = React.createRef();
        this.priceRef = React.createRef();
        this.dateRef = React.createRef();
        this.descriptionRef = React.createRef();
    }

    componentDidMount() {
        this.fetchEvents();
    }

    static contextType = authContext;

    modalConfirmHandler = () => {
        this.setState({
            creating: false
        })
        const title = this.titleRef.current.value;
        const price = +this.priceRef.current.value;
        const date = this.dateRef.current.value;
        const description = this.descriptionRef.current.value;

        if (title.trim().length === 0 || price === 0 || date.trim().length === 0 || description.trim().length === 0) {
            return;
        }

        const event = { title, price, date, description };
        console.log(event);

        const requestBody = {
            query: `
                    mutation {
                        createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}){
                            _id
                            title
                            description
                            date
                            price
                        }
                    }
                `
        }

        console.log(JSON.stringify(requestBody));

        const token = this.context.token;

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
                this.setState(prevState => {
                    const updatedEvents = [...prevState.events];
                    updatedEvents.push({
                        _id: resData.data.createEvent._id,
                        title: resData.data.createEvent.title,
                        description: resData.data.createEvent.description,
                        date: resData.data.createEvent.date,
                        price: resData.data.createEvent.price,
                        creator: {
                            _id: this.context.userId
                        }
                    })
                    return { events: updatedEvents }
                })
            }).catch(err => {
                console.log(err)
            })
    };

    modalCancelHandler = () => {
        this.setState({
            creating: false,
            selectedEvent: null
        })
    };

    startCreateHandler = () => {
        this.setState({
            creating: true
        })
    };

    fetchEvents = () => {
        this.setState({
            isLoading: true
        })
        const requestBody = {
            query: `
                    query {
                        events {
                            _id
                            title
                            description
                            date
                            price
                            creator{
                                _id
                                email
                            }
                        }
                    }
                `
        }

        console.log(JSON.stringify(requestBody));

        fetch('http://localhost:3000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json()
            }).then(resData => {
                console.log(resData);
                const events = resData.data.events;
                this.setState({
                    events: events,
                    isLoading: false
                })
            }).catch(err => {
                console.log(err);
                this.setState({
                    isLoading: true
                })
            })
    }

    showDetailHandler = (eventId) => {
        console.log("called showDetailHandler \n eventId", eventId)
        this.setState((prevState) => {
            const _selectedEvent = prevState.events.find(e => e._id === eventId)
            console.log("Previous state", prevState.events);
            return { selectedEvent: _selectedEvent }
        })
    }

    bookEventHandler = () => {

    }

    render() {

        return (
            <React.Fragment>
                {this.state.creating && (
                    <React.Fragment>
                        <Backdrop />
                        <Modal title="Add Event" confirmText="Confirm" canCancel canConfirm onCancel={this.modalCancelHandler} onConfirm={this.modalConfirmHandler}>
                            <form>
                                <div className="form-control">
                                    <label htmlFor="title">Title</label>
                                    <input type="text" id="title" ref={this.titleRef}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="price">Price</label>
                                    <input type="number" id="price" ref={this.priceRef}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="date">Date</label>
                                    <input type="datetime-local" id="date" ref={this.dateRef}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="description">
                                        Description</label>
                                    <textarea id="description" rows="4" ref={this.descriptionRef}></textarea>
                                </div>
                            </form>
                        </Modal>
                    </React.Fragment>
                )}
                {this.state.selectedEvent && (
                    <React.Fragment>
                        <Backdrop />
                        <Modal title={this.state.selectedEvent.title} confirmText="Book" canCancel canConfirm onCancel={this.modalCancelHandler} onConfirm={this.bookEventHandler}>
                            <h1>{this.state.selectedEvent.title}</h1>
                            <h2>{this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                            <p>{this.state.selectedEvent.description}</p>
                        </Modal>
                    </React.Fragment>)}
                {this.context.token && (
                    <div className="events-control">
                        <p>Share Your Own Events</p>
                        <button className="btn" onClick={this.startCreateHandler}>Create Events</button>
                    </div>)}
                {this.state.isLoading
                    ? < Spinner />
                    : <EventList
                        events={this.state.events}
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler} />}

            </React.Fragment>
        )
    }
}

export default Events
