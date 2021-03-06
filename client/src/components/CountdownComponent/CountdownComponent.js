import React, { useState, useEffect, useCallback } from "react";

import "./CountdownComponent.css";
import Axios from "axios";

export default function CountdownComponent(props) {
    const convertToMinutes = (seconds) => {
        const timeObj = {};
        timeObj.minutes = parseInt(seconds / 60);
        timeObj.seconds = seconds % 60;

        return timeObj;
    };
    const calculateTimeLeft = useCallback((booking_time) => {
        return convertToMinutes(
            ((booking_time + 1200000 - Date.now()) / 1000).toFixed(0)
        );
    }, []);

    const [timeLeft, setTimeLeft] = useState(
        calculateTimeLeft(props.booking_time)
    );

    useEffect(() => {
        if (props.booking_time + 1200000 <= Date.now()) {
            Axios.post(`/api/solution/unbook/${props.question_id}`)
                .then((res) => window.location.reload(true))
                .catch((err) => window.location.reload(true));
            return;
        }
        setTimeout(() => {
            setTimeLeft(calculateTimeLeft(props.booking_time));
        }, 1000);
    }, [timeLeft, calculateTimeLeft, props.booking_time, props.question_id]);

    return (
        <div className="countdown">
            {!!timeLeft.minutes && (
                <React.Fragment>
                    <div className="countdown__time">
                        {timeLeft.minutes < 10
                            ? `0${timeLeft.minutes}`
                            : timeLeft.minutes}
                    </div>
                    <div className="countdown__time">:</div>
                </React.Fragment>
            )}
            <div
                className="countdown__time"
                //Style countdown for the last minute
                style={
                    timeLeft.minutes === 0
                        ? {
                              color: "#8357C5",
                              fontSize: "4.5rem",
                          }
                        : {}
                }
            >
                {timeLeft.seconds < 10
                    ? `0${timeLeft.seconds}`
                    : timeLeft.seconds}
            </div>
        </div>
    );
}
