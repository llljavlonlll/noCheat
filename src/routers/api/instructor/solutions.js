const express = require("express");
const router = new express.Router();
const auth = require("../../../middleware/auth");
const Question = require("../../../models/questions");
const User = require("../../../models/users");
const solutionUpload = require("../tools/solution-uploader");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Book an available question
// POST /api/solution/book/:id
router.post("/book/:id", auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).send({ msg: "Question not found!" });
        }

        if (question.status === "Booked") {
            return res.status(400).send({ msg: "Question is already booked!" });
        }

        question.booked_by = req.user._id;
        question.booked_at = Date.now();
        question.status = "Booked";

        await question.save();

        // Release the question if not completed in 20 mins
        setTimeout(async () => {
            const question = await Question.findById(req.params.id);
            if (question.status === "Booked") {
                question.booked_by = undefined;
                question.booked_at = undefined;
                question.status = "Pending";
                await question.save();
            }
        }, 1000 * 60 * 20);

        res.send({
            booked_by: question.booked_by,
            booked_at: question.booked_at,
        });
    } catch (err) {
        res.status(400).send({ msg: err.message });
    }
});

// Unbook question
// POST /api/solution/unbook/:id
router.post("/unbook/:id", auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        // If no question return err
        if (!question) {
            return res.status(404).send({ msg: "Question not found!" });
        }

        // If quesiton not booked return err
        if (!question.booked_by) {
            return res.status(400).send({ msg: "Question already unbooked" });
        }

        // If question is booked by different user return err
        if (!question.booked_by.equals(req.user._id)) {
            return res
                .status(400)
                .send({ msg: "Question booked by different user" });
        }

        question.booked_by = undefined;
        question.booked_at = undefined;
        question.status = "Pending";

        await question.save();
        res.send({ status: question.status });
    } catch (err) {
        res.status(400).send({ msg: err.message });
    }
});

// Reject question
// POST /api/solution/reject/:id
router.post("/reject/:id", auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).send({ msg: "Question not found!" });
        }

        // Update status of the question to "Rejected"
        question.rejected_by = req.user._id;
        question.status = "Rejected";
        await question.save();

        // Refund credits to the questions owner
        const student = await User.findById(question.owner);
        student.balance = student.balance + 1;
        await student.save();

        res.send({ status: question.status });
    } catch (err) {
        res.status(400).send({ msg: err.message });
    }
});

// Add solution to the question, selected by id
// POST /api/solution/:id
router.post(
    "/:id",
    auth,
    solutionUpload.single("solution"),
    async (req, res) => {
        const solutionEntries = ["solution", "description", "questionName"];
        const updates = Object.keys(req.body);

        // Check if solution request has only allowed fields
        const allowSolution = updates.every((update) =>
            solutionEntries.includes(update)
        );

        const user = req.user;

        if (!allowSolution) {
            return res.status(400).send({ msg: "Invalid solution request" });
        }

        try {
            const question = await Question.findById(req.params.id);

            if (!question) {
                return res.status(404).send({ msg: "Question not found!" });
            }

            // Lower image size
            await sharp(req.file.path)
                .rotate()
                .resize({ width: 600 })
                .png({ quality: 80 })
                .jpeg({ quality: 80 })
                .toFile(
                    path.resolve(req.file.destination, "..", req.file.filename)
                );

            // Make a thumbnail
            await sharp(req.file.path)
                .resize({ width: 300 })
                .png({ quality: 80 })
                .jpeg({ quality: 80 })
                .toFile(
                    path.resolve(
                        req.file.destination,
                        "..",
                        "thumbnails",
                        req.file.filename
                    )
                );

            fs.unlinkSync(req.file.path);

            // Add solution and save
            question.solution.push({
                ...req.body,
                image: req.file.filename,
                solved_by: req.user._id,
                solved_at: Date.now(),
            });
            question.status = "Completed";
            await question.save();

            // Deposit credit to instructor balance and save
            user.balance = user.balance + 1;
            await user.save();

            res.send({
                status: question.status,
                solution: question.solution,
            });
        } catch (err) {
            res.status(400).send({ msg: err.message });
        }
    }
);

module.exports = router;
