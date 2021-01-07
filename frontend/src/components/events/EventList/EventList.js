import React from 'react';

import EventItem from './EventItem/EventItem';

import './EventList.css';

export default function EventList(props) {
    const events = props.events.map(event => {
        console.log(event._id)
        return (<EventItem
            key={event._id}
            eventId={event._id}
            title={event.title}
            price={event.price}
            date={event.date}
            userId={props.authUserId}
            creator={event.creator._id}
            onDetail={props.onViewDetail} />)
    })
    return (
        <>
            <ul className="event__list">
                {events}
            </ul>
        </>
    )
}
