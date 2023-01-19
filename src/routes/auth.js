const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const router = Router();

router.post(
    '/registration',
    [
        check('email').isEmail(),
        check('password').isLength({min: 1}),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'The data provided during registration is incorrect.',
                    errors: errors.array(),
                });
            }

            const {email, password, username, passwordConfirm} = req.body;

            if (password !== passwordConfirm) {
                return res.status(400).json({
                    message: 'Sorry, but your passwords do not match, be careful.',
                });
            }

            const isUserAlreadyExists = !!await userModel.findOne({email});

            if (isUserAlreadyExists) {
                return res.status(400).json({message: 'Oops, a user with this email already exists in our service, check the entered data.'});
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const user = new userModel({
                email,
                username,
                password: passwordHash,
                registrationDate: Date.now(),
            });
            await user.save();
            return res.status(200).json({message: 'User was created.'});
        } catch (e) {
            res.status(500).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
        }
    }
);

router.post(
    '/login',
    [
        check('email').isEmail().normalizeEmail(),
        check('password').exists(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Trouble, you entered incorrect login information, be careful.',
                });
            }

            const {email, password} = req.body;
            const currentUser = await userModel.findOne({email});

            if (!currentUser) {
                return res.status(400).json({message: 'The user is not visible in our database, please register.'});
            }

            if (currentUser.status) {
                return res.status(400).json({message: "Here's the problem, you've been blocked."});
            }

            const isPasswordMatch = await bcrypt.compare(password, currentUser.password);

            if (!isPasswordMatch) {
                return res
                    .status(400)
                    .json({message: 'You entered the wrong password, please try again.'});
            }

            const token = jwt.sign({userId: currentUser.id}, process.env.JWT_SECRET);
            currentUser.lastVisit = Date.now();
            await currentUser.save();
            res.json({token, record: {...currentUser, id: currentUser._id}});
        } catch (e) {
            res.status(500).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
        }
    }
);

router.get(
    '/refresh',
    [],
    async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(401).json({message: 'You are not logged in, please login.'});
            }

            const user = jwt.verify(token, process.env.JWT_SECRET);
            const currentUser = await userModel.findOne({_id: user.userId});

            if (currentUser.status) {
                return res.status(401).json({message: 'You just got banned.'});
            }

            if (!currentUser) {
                return res.status(401).json({message: 'Your account has just been deleted.'});
            }

            res.json({
                id: currentUser._id,
                username: currentUser.username,
                status: currentUser.status,
                email: currentUser.email,
                registrationDate: currentUser.registrationDate,
                lastVisit: currentUser.lastVisit
            });
        } catch (e) {
            res.status(500).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
        }
    }
);

module.exports = router;
