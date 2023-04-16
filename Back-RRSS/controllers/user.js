'use strict'

const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../service/jwt');
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

const saveUser = (async (req, res) => {
    const params = req.body;
    const user = new User();

    if (params.name && params.surname && params.nick && params.email && params.password) {
        user.name = params.user;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        try {
            const userDB = await User.find({
                $or: [
                    { email: user.email.toLowerCase() },
                    { nick: user.nick.toLowerCase() },
                ]
            }).exec();
            if (userDB.length > 0) return res.status(500).send({ message: 'Ya existe' });
        } catch (err) {
            console.log(err);
        }

        const hashPasw = async (err, hash) => {
            user.password = hash;

            try {
                const userStored = await user.save(); // Guarda el modelo en la base de datos y espera el resultado
                if (userStored) res.status(200).send({ user: userStored }); // Envía una respuesta exitosa con el modelo guardado
                else res.status(404).send({ message: 'Error no se ha registrado' }); // Envía una respuesta de error si no se guardó el modelo
            } catch (error) {
                return res.status(500).send({ err: err });
            }

        };

        bcrypt.hash(params.password, null, null, hashPasw);


    } else {
        res.status(200).send({
            message: "Envia todo los parametros",
        });
    }
});

const loginUser = (async (req, res) => {
    const params = req.body;


    try {
        const userDB = await User.findOne({ email: params.email });
        const validation = ((_error, check) => {
            if (check) {
                userDB.password = undefined;
                if (params.getToken) {
                    return res.status(200).send({
                         token: jwt.createToken(userDB),
                         user: userDB
                        });
                }
                return res.status(200).send({ userDB })
            }
            else return res.status(404).send({ message: 'Contraseña incorrecta' });
        });
        if (userDB)
            bcrypt.compare(params.password, userDB.password, validation);
        else return res.status(500).send({ err: 'No existe' });
    } catch (err) {
        return res.status(500).send({ err: err });
    }
});

const getUser = (async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        const following = await Follow.findOne({ "user": req.user.sub, "followed": userId });
        const followed = await Follow.findOne({ "user": userId, "followed": req.user.sub });

        if (user) {
            delete user.password;
            return res.status(200).send({
                user,
                following,
                followed
            });
        }
        else return res.status(404).send({ message: 'No existe' });
    } catch (err) {
        return res.status(500).send({ err: err });
    }
});

const getUsers = (async (req, res) => {

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;

    try {

        const users = await User.find().sort('_id').paginate(page, itemsPerPage);

        if (!users) return res.status(404).send({ message: "No hay usuarios disponibles" });

        const total = await User.countDocuments();
        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                users,
                total,
                pages: Math.ceil(total / itemsPerPage),
                users_following: value.following,
                users_follow_me: value.followed
            });
        });
    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }
});

const followUserIds = (async (user_id) => {
    try {
        const following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec();
        const followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec();

        var following_clean = [];
        following.forEach((follow) => {
            following_clean.push(follow.followed);
        });

        var followed_clean = [];
        followed.forEach((follow) => {
            followed_clean.push(follow.user);
        });

        return {
            following: following_clean,
            followed: followed_clean
        }
    } catch (error) {
        return handleError(error);
    }
});


const updateUser = (async (req, res) => {
    const userId = req.params.id;
    const update = req.body;

    if (userId != req.user.sub) return res.status(500).send({
        message: "No tienes permiso para actualizar este usuario"
    });

    try {
        const userExist = await User.find(
            { $or: [{ nick: update.nick }, { email: update.email }] }
        );
        if (userExist?.length > 1) return res.status(500).send({ message: "The user already exists" });
        const userUpdated = await User.findByIdAndUpdate(userId, update, { new: true });

        if (!userUpdated) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });
        delete userUpdated.password;
        return res.status(200).send({ user: userUpdated });
    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }
});

const uploadImage = (async (req, res) => {
    const userId = req.params.id;



    if (req.files.image) {
        const file_path = req.files.image.path;
        const file_split = file_path.split('\/');
        const file_name = file_split[2];
        const ext_split = file_name.split('\.');
        const file_ext = ext_split[1];

        if (userId != req.user.sub) {
            return removeFile(file_path, res, "No tienes permiso para actualizar este usuario");
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            try {
                const userUpdated = await User.findByIdAndUpdate(userId, { image: file_name }, { new: true });
                if (!userUpdated) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });
                return res.status(200).send({ user: userUpdated });
            } catch (error) {
                return res.status(500).send({ message: "Error en la petición: " + error });
            }
        } else {
            return removeFile(file_path, res, 'Extensión no válida');
        }
    } else {
        return res.status(200).send({ message: "No se han subido archivos" });
    }
});

const removeFile = ((file_path, res, message) => {
    fs.unlink(file_path, (err) => {
        if (err) return res.status(200).send({ message: "Extensión no válida y fichero no borrado" });
        return res.status(200).send({ message });
    });
});

const getImageFile = (async (req, res) => {
    const image_file = req.params.imageFile;
    const path_file = './uploads/users/' + image_file;
    if (!fs.existsSync(path_file)) return res.status(500).send({ message: "Imagen no existente" });
    else return res.status(200).sendFile(path.resolve(path_file));
});

const getCounters = (async (req, res) => {

    var userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }

    try {

        const following = await Follow.countDocuments({ user: userId });
        const followed = await Follow.countDocuments({ followed: userId });
        const publications = await Publication.countDocuments({ user: userId });

        res.status(200).send({
            following,
            followed,
            publications,
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

});



module.exports = {
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounters,
}