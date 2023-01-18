module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({message: 'You are not logged in, please log in.'});
        }

        next();
    } catch (e) {
        res.status(401).json({message: 'You are not logged in, please log in.'});
    }
}
