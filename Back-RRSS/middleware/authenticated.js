'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta';


const ensureAuth = (req, res, next) => {
    console.log('ensureAuth');
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no tiene cabecera de autenticación' });
    }

    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        console.log('token');
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({ message: 'El token ha expirado' });
        }
    } catch (ex) {
        return res.status(404).send({ message: 'El token no es válido' });
    }

    req.user = payload;

    next();
}

const ensureAuthSocket = (_token) => {

    var token = _token.replace(/['"]+/g, '');

    try {

        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return '';
        }

        return payload;

    } catch (error) {
        return '';
    }

}

module.exports = {
    ensureAuth,
    ensureAuthSocket,
}