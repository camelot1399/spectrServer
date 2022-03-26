const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User, Basket} = require('../models/models');

const generatejwt = (id, email, role) => {
    return jwt.sign(
        {id, email: email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    );
}

class UserController {
    async registration(req, res, next) {
        const {email, password, role} = req.body;

        console.log('email', email);
        console.log('pass', password);

        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный пароль или email'));
        }

        const candidate = await User.findOne({where: {email}});

        if (candidate) {
            return next(ApiError.badRequest('Такой email существует'));
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({email, password: hashPassword, role});
        const basket = await Basket.create({userId: user.id});
        const token = generatejwt(user.id, user.email, user.role);

        return res.json({token});
    }

    async login(req, res, next) {
        const {email, password} = req.body;

        console.log('email', email);
        console.log('pass', password);
        
        const user = await User.findOne({where: {email}});

        if (!user) {
            return next(ApiError.internal('Пользователь не найден'));
        }

        let comparePassword = bcrypt.compareSync(password, user.password);

        if (!comparePassword) {
            return next(ApiError.internal('Не верный пароль!'));
        }

        const token = generatejwt(user.id, user.email, user.role);

        return res.json({token});

    }

    async check(req, res, next) {
        const token = generatejwt(req.user.id, req.user.email, req.user.role);

        return res.json({token});
    }
}

module.exports = new UserController();