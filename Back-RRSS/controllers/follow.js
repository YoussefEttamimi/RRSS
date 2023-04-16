'use stricit'

// const path = require('path');
// const fs = require('fs');
const mongoosePaginate = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');

const saveFollow = (async (req, res) => {
    const params = req.body;
    const follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;

    try {
        //Validamos que el id del usuario al que va a seguir exista. 
        const checkUser = await User.findById(follow.followed);
        if (!checkUser) return res.status(404).send({ message: "El ID del usuario no existe" });

        //Validamos que no haga un follow duplicado. 
        const checkFollow = await Follow.countDocuments({ user: follow.user, followed: follow.followed });
        if (checkFollow > 0) return res.status(404).send({ message: "Ya estás siguiendo a ese usuario" });

        const followStored = await follow.save();
        if (followStored) res.status(200).send({ follow: followStored });
        else res.status(404).send({ message: 'No se ha guardado el seguimiento' });
    } catch (err) {
        return res.status(500).send({ message: 'Error al guardar el seguimiento' });
    }
});

const deleteFollow = (async (req, res) => {
    const userId = req.user.sub;
    const followId = req.params.id;

    try {
        const followRemoved = await Follow.deleteOne({ user: userId, followed: followId });
        if (followRemoved.deletedCount == 0) return res.status(404).send({ message: "No se ha eliminado el follow, posiblemente no exista" });
        return res.status(200).send({ message: "Se ha eliminado el follow" });
    } catch (err) {
        return res.status(500).send({ message: 'Error al eliminar el seguimiento' });
    }
});

const getFollowingUsers = (async (req, res) => {
    let userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    const itemsPerPage = 4;

    try {
        const follows = await Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage);
        if (!follows) return res.status(404).send({ message: 'No sigues a ningún usuario' });
        const total = await Follow.countDocuments({ user: userId });

        return res.status(200).send({
            follows,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    } catch (err) {
        return res.status(500).send({ message: 'Error en la petición' + err });
    }
});

const getFollowedUsers = (async (req, res) => {
    let userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    const itemsPerPage = 4;

    try {
        const follows = await Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage);
        if (!follows) return res.status(404).send({ message: 'No te sigue ningún usuario' });
        const total = await Follow.countDocuments({ followed: userId });

        return res.status(200).send({
            follows,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    } catch (err) {
        return res.status(500).send({ message: 'Error en la petición' + err });
    }
});

const getMyFollows = (async (req, res) => {
    const userId = req.user.sub;
    const followed = req.params.followed;
    let follows;

    try {
        if (followed) {
            follows = await Follow.find({ followed: userId });
        } else {
            follows = await Follow.find({ user: userId });
        }

        return res.status(200).send({
            follows,
        });
    } catch (err) {
        return res.status(500).send({ message: 'Error en la petición' + err });
    }
});


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows,
};