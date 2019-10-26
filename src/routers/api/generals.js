// General routes
const User = require("../../models/users");
const auth = require("../../middleware/auth");
const transporter = require("./tools/email-transporter");
const router = new require("express").Router();
const jwt = require("jsonwebtoken");

// Renew password
// POST /api/new_password
router.post("/new_password", async (req, res) => {
    try {
        const user = await User.findById(req.body.user_id);
    } catch (err) {
        res.status(400).send({ status: "error", msg: err.message });
    }
});

// Reset password email
// POST /api/password_reset
router.post("/password_reset", async (req, res) => {
    const email = req.body.email;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({
                status: "error",
                msg: "Can't find that email, sorry.",
                err: "User not found"
            });
        }

        const hash = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET
        );
        const pass_reset_url = `http://www.jbtruckers.com/password_reset/${hash}`;
        const mailOptions = {
            from: "no-reply@jbtruckers.com",
            to: email,
            subject: "noCheat | Password Reset",
            html: `<p>To reset your password go here: </p><br>${pass_reset_url}`
        };

        transporter
            .sendMail(mailOptions)
            .then(info => {
                console.log(info.response);
                res.send({
                    status: "ok",
                    msg: `Email with password reset instructions has been sent to ${email}`
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({
                    status: "error",
                    msg: `Error sending instructions`,
                    err
                });
            });
    } catch (err) {
        res.status(400).send({ err });
    }
});

// Create a user
// POST /api/sign-up
router.post("/sign-up", async (req, res) => {
    const user = new User(req.body);

    try {
        const token = await user.generateAuthToken("signup");

        res.cookie("token", token)
            .status(201)
            .send({
                name: user.name,
                email: user.email,
                category: user.category
            });

        const hash = user.activationHash;
        const verificationUrl = `http://www.jbtruckers.com/verify/${hash}`;
        const html = `<h2>Thanks for signing up for noCheat! Please click the link below to confirm your email address.</h2>
                        <br>
                        <h1 style="background-color: purple; display: inline-block; padding: 5px;">
                            <a style="color: white; text-decoration: none;" href=${verificationUrl}>
                                Click here to verify your email
                            </a>
                        </h1>
                        <br>
                        <h2>or go to:</h2>
                        <br>
                        ${verificationUrl}`;
        const mailOptions = {
            from: "no-reply@jbtruckers.com",
            to: req.body.email,
            subject: "noCheat | Email verification",
            html
        };

        transporter
            .sendMail(mailOptions)
            .then(info => {
                console.log(info.response);
            })
            .catch(err => {
                console.log(err);
            });
    } catch (err) {
        res.status(400).send({ err });
    }
});

// Login
// POST /api/login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );

        const token = await user.generateAuthToken("login");

        res.cookie("token", token).send({
            name: user.name,
            email: user.email,
            category: user.category
        });
    } catch (err) {
        res.status(400).send({ err: err.message });
    }
});

// Logout
// POST /api/logout
router.post("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token != req.token;
        });

        await req.user.save();

        res.send();
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Logout all instances
// POST /api/logoutall
router.post("/logoutall", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Check if current token is valid
// GET /api/checkToken
router.get("/checkToken", auth, (req, res) => {
    res.sendStatus(200);
});

module.exports = router;
