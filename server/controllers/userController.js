const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User, Basket} = require('../models/models');

const generateJWT = (id, email, role) => {
    return jwt.sign(
        {id, email, role}, 
    process.env.SECRET_KEY,
        { expiresIn: '24h' }
)
}


class UserController {
    async registration(req, res, next) {  
        const {email, password, role} = req.body
        if (!email ||!password) {
            return next(ApiError.badRequest('Некорректный email или пароль'))
        }
        const candidate = await User.findOne({ where: { email } });
        if (candidate) {
            return next(ApiError.badRequest('Такой пользователь уже существует'))
        }
        const hashedPassword = await bcrypt.hash(password, 5);
        const user = await User.create({
            email,
            password: hashedPassword,
            role
        })
        const basket = await Basket.create({
            userId: user.id
        })
        const token = generateJWT(user.id, user.email, user.role)
        return res.json({token})

    }  

    async login(req, res) { 
        const {email, password} = req.body
    }
    async check(req, res, next) {
        const {id} = req.query
        if (!id) { 
            return next(ApiError.badRequest('Не задан ID'))
        }
        res.json(id)
        }
}

module.exports = new UserController()