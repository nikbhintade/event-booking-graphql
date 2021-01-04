import React, { Component } from 'react'

import Backdrop from '../components/backdrop/Backdrop';
import Modal from '../components/modal/Modal';
import authContext from '../context/auth-context';

import './Events.css'

export class Events extends Component {
    constructor(props) {
        super(props);
        this.state = {
            creating: false,
            events: []
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
                            creator{
                                _id
                                email
                            }
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
                this.fetchEvents();
            }).catch(err => {
                console.log(err)
            })
    };

    modalCancelHandler = () => {
        this.setState({
            creating: false
        })
    };

    startCreateHandler = () => {
        this.setState({
            creating: true
        })
    };

    fetchEvents = () => {

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
                const events = resData.data.events;
                this.setState({
                    events: events
                })
            }).catch(err => {
                console.log(err)
            })
    }

    render() {
        const eventList = this.state.events.map(event => {
            return <li key={event._id} className="events__list-item">
                {event.title}
            </li>
        })
        return (
            <React.Fragment>
                {this.state.creating && (
                    <React.Fragment>
                        <Backdrop />
                        <Modal title="Add Event" canCancel canConfirm onCancel={this.modalCancelHandler} onConfirm={this.modalConfirmHandler}>
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
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" rows="4" ref={this.descriptionRef}></textarea>
                                </div>
                            </form>
                        </Modal>
                    </React.Fragment>
                )}
                {this.context.token && (
                    <div className="events-control">
                        <p>Share Your Own Events</p>
                        <button className="btn" onClick={this.startCreateHandler}>Create Events</button>
                    </div>)}
                <ul className="events__list">
                    {eventList}
                </ul>
            </React.Fragment>
        )
    }
}

export default Events
