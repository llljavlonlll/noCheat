const mongoose = require("mongoose");
const Chat = require("./chat");
const AutoIncrement = require("../db/mongoose");
const moment = require("moment");

const questionSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    image_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: 255,
        minLength: 1
    },
    subject: {
        type: String,
        required: true
    },
    uploaded_at: {
        type: Number,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        default: "Pending",
        validate(value) {
            const statuses = ["Pending", "Booked", "Completed", "Rejected"];
            if (!statuses.includes(value)) {
                throw new Error("Invalid status");
            }
        }
    },
    booked_by: mongoose.Schema.Types.ObjectId,
    solved_by: mongoose.Schema.Types.ObjectId,
    rejected_by: mongoose.Schema.Types.ObjectId,
    solution: [
        {
            image: {
                type: String,
                require: true
            },
            description: String,
            solved_by: {
                type: mongoose.Schema.Types.ObjectId,
                require: true
            },
            solved_at: {
                type: Date,
                required: true
            }
        }
    ],
    chat: mongoose.Schema.Types.ObjectId
});

questionSchema.plugin(AutoIncrement, { inc_field: "qid" });

questionSchema.pre("save", async function(next) {
    const chat = new Chat({
        owner: this.owner
    });

    const savedChat = await chat.save();
    this.chat = savedChat._id;
    next();
});

module.exports = Question = mongoose.model("Question", questionSchema);
