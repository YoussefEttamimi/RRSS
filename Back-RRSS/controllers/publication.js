'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var Follow = require('../models/follow');

async function savePublication(req, res) {
    var params = req.body;

    if (!params.text) return res.status(200).send({ message: "Debes enviar un texto" });

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    try {
        const publicationStored = await publication.save();
        if (!publicationStored) return res.status(404).send({ message: "No se ha guardado la publicación" });
        return res.status(200).send({ publication: publicationStored });
    }
    catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }
}


const getPublications = async (req, res) => {

    const page = 1;
    if (req.params.page)
        page = req.params.page;

    const itemsPerPage = 2;

    try {

        const follows = await Follow
        .find({ user: req.user.sub })
        .select({ '_id': 0, '__v': 0, 'user': 0 });
        
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        follows_clean.push(req.user.sub);

        const publications = await Publication
            .find({ user: { "$in": follows_clean } })
            .sort('-created_at')
            .populate('user')
            .paginate(page, itemsPerPage);

        const total = await Publication.countDocuments({ user: { "$in": follows_clean } });
        if (!publications) return res.status(404).send({ message: "No se ha guardado la publicación" });
        return res.status(200).send({
            publications: publications,
            total: total,
            pages: Math.ceil(total / itemsPerPage),
        });



    }
    catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }
}

const getPublication = async (req, res) => {
    const publicationId = req.params.id;

    try {
        const publication = await Publication.findById(publicationId).populate('user');
        if (!publication) return res.status(404).send({ message: "No existe la publicación" });
        return res.status(200).send({ publication });
    }
    catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }
}

const deletePublication = async (req, res) => {
    const publicationId = req.params.id;

    try {
        const publication = await Publication.deleteOne({ _id: publicationId, user: req.user.sub });
        if (publication.deletedCount == 0) return res.status(404).send({ message: "No existe la publicación" });
        return res.status(200).send({ message: "Publicación eliminada" });
    }
    catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }
}

const uploadFile = (async (req, res) => {
    const publicationId = req.params.id;



    if (req.files.file) {
        const file_path = req.files.file.path;
        const file_split = file_path.split('\/');
        const file_name = file_split[2];
        const ext_split = file_name.split('\.');
        const file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            try {
                const publicationUpdated = await Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true });
                console.log(publicationUpdated);
                if (!publicationUpdated) return res.status(404).send({ message: "No se ha podido actualizar la publicacion" });
                return res.status(200).send({ publication: publicationUpdated });
            } catch (error) {
                return res.status(500).send({ message: "Error en la petición: " + error });
            }
        } else {
            return removeFile(file_path, res, 'Extensión no válida');
        }
    } else {
        return res.status(200).send({ message: "No se han subido archivos por formato" });
    }
});

const removeFile = ((file_path, res, message) => {
    fs.unlink(file_path, (err) => {
        if (err) return res.status(200).send({ message: "Extensión no válida y fichero no borrado" });
        return res.status(200).send({ message });
    });
});

const getFile = (async (req, res) => {
    const publication_file = req.params.imageFile;
    const path_file = './uploads/publications/' + publication_file;
    if (!fs.existsSync(path_file)) return res.status(500).send({ message: "Fichero no existente" });
    else return res.status(200).sendFile(path.resolve(path_file));
});



module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadFile,
    getFile,
}