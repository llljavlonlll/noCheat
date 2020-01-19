import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import "./QuestionTileComponent.css";

export default function QuestionTileComponent(props) {
    return (
        <Link
            // to={`/question/${props._id}`}
            to={`/${props._id}`}
            style={{ textDecoration: "none", color: "#a5afd7" }}
        >
            <div className="question-tile">
                <div className="question-tile__image-container">
                    <img
                        src={`/images/questions/${props.image_name}`}
                        alt="Question"
                    />
                </div>
                <div className="question-tile__content">
                    <h3>
                        {props.description.length >= 22
                            ? props.description.substring(0, 21) + "..."
                            : props.description}
                    </h3>
                    <div className="question-tile__bullets">
                        <ul>
                            <li>Subject: {props.subject}</li>
                            <li>
                                Status:{" "}
                                <span
                                    style={
                                        props.status === "Pending"
                                            ? { color: "red" }
                                            : props.status === "Booked"
                                            ? { color: "yellow" }
                                            : { color: "green" }
                                    }
                                >
                                    {props.status}
                                </span>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                Uploaded at:{" "}
                                {moment(props.uploaded_at).format("DD/MM/YYYY")}
                            </li>
                            {/*<li>Solved by: Javlonbek B.</li>*/}
                        </ul>
                    </div>
                </div>
            </div>
        </Link>
    );
}