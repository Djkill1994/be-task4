const {Router} = require('express');
const userModel = require('../models/user');
const authMiddleware = require('../middlewares/auth');
const router = Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users?.map((user) => ({
            id: user._id,
            username: user.username,
            status: user.status,
            email: user.email,
            registrationDate: user.registrationDate,
            lastVisit: user.lastVisit
        })));
    } catch (e) {
        res.status(400).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
    }
})

router.delete('/delete', authMiddleware, async (req, res) => {
    try {
        const {ids} = req.body;
        await userModel.deleteMany({_id: ids})
        res.status(200).json({message: 'User has been deleted.'});
    } catch (e) {
        res.status(400).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
    }
})

router.post('/ban', authMiddleware, async (req, res) => {
    try {
        const {ids} = req.body;
        await userModel.updateMany({_id: ids}, {$set: {status: true}})
        res.status(200).json({message: 'User was banned.'});
    } catch (e) {
        res.status(400).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
    }
})

router.post('/unban', authMiddleware, async (req, res) => {
    try {
        const {ids} = req.body;
        await ids.map(async (id) => await userModel.findByIdAndUpdate(id, {status: false}));
        res.status(200).json({message: 'User was unbanned.'});
    } catch (e) {
        res.status(400).json({message: 'Some magic happened, please try again to perform the actions you have done, thank you.'});
    }
})

module.exports = router;
