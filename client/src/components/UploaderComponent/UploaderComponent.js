import React, { Component } from "react";
import axios from "axios";
import { addQuestion } from "../../actions/questionsActions";
import { connect } from "react-redux";
import "./UploaderComponent.css";

class UploaderComponent extends Component {
    state = {
        filePreview: undefined,
        file: "",
        inputKey: Date.now(), // this value is to force file input field to re-render
        description: "",
        subject: "Math"
    };

    handleInputChange = event => {
        if (event.target.files[0]) {
            this.setState({
                filePreview: URL.createObjectURL(event.target.files[0]),
                file: event.target.files[0]
            });
        } else {
            this.setState({
                filePreview: undefined,
                file: ""
            });
        }
    };

    onSubmit = event => {
        event.preventDefault();
        this.props.handleUploadAnimation();
        const { file, description, subject } = this.state;

        const data = new FormData();
        data.append("question", file);
        data.append("description", description);
        data.append("subject", subject);

        const config = {
            headers: {
                "content-type": "multipart/form-data"
            }
        };

        axios
            .post("/api/question/create", data, config)
            .then(res => {
                if (res.status === 200) {
                    this.setState({
                        filePreview: null,
                        file: "",
                        inputKey: Date.now(), // Update key to force re-render
                        description: "",
                        subject: "Math"
                    });
                    this.props.dispatch(addQuestion(res.data));
                }
                this.props.handleUploadAnimation();
            })
            .catch(err => {
                console.error(err);
                this.props.handleUploadAnimation();
            });
    };

    onChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        return (
            <div className="question-uploader">
                <h3 className="question-uploader__title">
                    Upload your question
                </h3>
                <form onSubmit={this.onSubmit}>
                    <div className="question-uploader__container">
                        <div className="question-uploader__input">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={this.state.description}
                                onChange={this.onChange}
                            />
                        </div>
                        <div className="question-uploader__input">
                            <label htmlFor="subject">Subject</label>
                            <select
                                value={this.state.subject}
                                onChange={this.onChange}
                                name="subject"
                                id="subject"
                            >
                                <option value="Math">Math</option>
                                <option value="English">English</option>
                                <option value="History">History</option>
                            </select>
                        </div>
                        <div className="image-preview">
                            <input
                                required
                                type="file"
                                onChange={this.handleInputChange}
                                name="question"
                                key={this.state.inputKey}
                            />
                            {this.state.filePreview && (
                                <img
                                    src={this.state.filePreview}
                                    alt="Uploaded question"
                                />
                            )}
                        </div>
                        <button>Upload Question</button>
                    </div>
                </form>
            </div>
        );
    }
}

export default connect()(UploaderComponent);