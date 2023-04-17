'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

async function saveMessage(req, res) {

    var params = req.body;

    if (!params.text || !params.receiver)
        return res.status(404).send({ message: "Envía los datos necesarios" });

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    try {

        const messageStored = await message.save();
        if (!messageStored) return res.status(404).send({ message: "El mensaje no se ha guardado" });

        res.status(200).send({ messageStored: messageStored });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

const getReceivedMessages = (async (req, res) => {

    const userId = req.user.sub;

    const page = 1;
    if (req.params.page)
        page = req.params.page;

    const itemsPerPage = 4;

    try {

        const messages = await Message
            .find({ receiver: userId })
            .populate('emitter', 'name surname _id nick image')
            .paginate(page, itemsPerPage);

        if (!messages) return res.status(404).send({ message: "No hay mensajes" });

        const total = await Message.countDocuments({ receiver: userId });

        return res.status(200).send({
            messages: messages,
            total: total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

});

const getEmmitMessages = (async (req, res) => {

    const userId = req.user.sub;

    const page = 1;
    if (req.params.page)
        page = req.params.page;

    const itemsPerPage = 4;

    try {

        const messages = await Message
            .find({ emitter: userId })
            .populate('emitter receiver', 'name surname _id nick image')
            .paginate(page, itemsPerPage);

        if (!messages) return res.status(404).send({ message: "No hay mensajes" });

        const total = await Message.countDocuments({ emitter: userId });

        return res.status(200).send({
            messages: messages,
            total: total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

});

const getUnviewedMessages = (async (req, res) => {

    const userId = req.user.sub;

    try {

        const count = await Message.countDocuments({ receiver: userId, viewed: 'false' });

        if (!count) return res.status(404).send({ message: "No hay mensajes" });

        return res.status(200).send({ unviewed: count });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

});

async function setViewedMessages(req, res) {
    var userId = req.user.sub;
    try {
        const messagesUpdated = await Message.updateMany({ receiver: userId, viewed: 'false' },
            { viewed: 'true' });
        return res.status(200).send({ messages: messagesUpdated });
    } catch (error) { return res.status(500).send({ message: "Error en la petición: " + error }); }
}

async function saveMessageSocket(user, message) {

    var params = message;

    if (!params.text || !params.receiver)
        return { error: true, message: "Envía los datos necesarios" };

    var message = new Message();
    message.emitter = user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    try {

        const messageStored = await message.save();
        if (!messageStored) return { error: true, message: "El mensaje no se ha guardado" };

        //Obtenemos el mensaje creado.
        const messageStoredNew = await Message.findById(messageStored._id).populate('emitter receiver', 'name surname _id nick image')

        return { error: false, messageStored: messageStoredNew };

    } catch (error) {
        return { error: true, message: "Error en la petición: " + error };
    }

}

async function getMessagesSocket(req, res) {

    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 1000;

    try {

        //En el populate indicamos los campos que queremos.
        const messages = await Message.find(({
            $or: [
                { emitter: userId },
                { receiver: userId }
            ]
        })).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage);
        if (!messages) return res.status(500).send({ message: "No hay mensajes" });

        const total = await Message.countDocuments({ receiver: userId });

        return res.status(200).send({
            messages: messages,
            total: total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}



module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages,
    saveMessageSocket,
    getMessagesSocket
}