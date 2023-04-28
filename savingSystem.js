const fs = require('fs');
const path = require('path');
const util = require('util');

const {getSgbd} = require("./utils.js");


//chemin du répertoire de sauvegarde
const chemin = "./maintenence/";

//definir la période du cycle de sauvegarde 
const period = 60000;

var modifiedDatabases = [];
var deletedDatabases = [];

// Sauvegarde des bases de données modifiées.
const save = (sgbd, databases) =>{
    console.log("saving ...");
    if(Array.isArray(databases)){
        if(databases.length != 0){
            databases.forEach(database =>{
                saveData(sgbd, database);
            });
        }else{
            console.log("Nothing to save.");
        }
    }else{
        console.log("not array");
    }
}

//Sauvegarde d'une base de données dans un fichier .JSON.
const saveData = async (sgbd, database) => {
    const data = sgbd[database];
    if (data === undefined) {
        console.error(`La propriété '${database}' n'est pas définie dans l'objet 'sgbd'`);
        return;
    }
    const parsedData = JSON.stringify(data);
    const path = `${chemin}${database}.json`;
    if(!fs.existsSync(path)){
        fs.writeFileSync(path, '');
    }
    fs.writeFileSync(path, parsedData);
    console.log("Saved!");
}

//Chargement des bases de données modifiées en mémoire.
const loadData = async (storagePath, sgbd) =>{
    try {
        console.log("Initialisation ...");
        const nomsFichiers = await fs.promises.readdir(storagePath);
        for (const nomFichier of nomsFichiers) {
            const cheminFichier = storagePath+nomFichier;
            const statFichier = await fs.promises.stat(cheminFichier);
            if (statFichier.isFile()) {
                const nomSousObjet = path.parse(nomFichier).name;
                const contenuFichier = await fs.promises.readFile(cheminFichier, 'utf8');
                sgbd[nomSousObjet] = JSON.parse(contenuFichier);
            }
        }
        console.log("Initialisation Done !")
    } catch (err) {
        console.error(`Erreur lors de l'ajout des fichiers dans l'objet : ${err}`);
    }
}

//Suppression du fichier contenant la base de donnée sauvegardée.
const deleteFiles = (databases) =>{
    if(Array.isArray(databases)){
        if(databases.length !=0){
            databases.forEach(database =>{
                const filePath = path.join(chemin, database + '.json');
                fs.unlink(filePath, (err) => {
                    if (err) {
                    console.error(err);
                    return;
                    }
                    console.log(`${database} a été supprimé avec succès.`);
                });
            });
        }
    }else{
        console.log("not array");
    }
}



const startCycle = () =>{
    let sgbd = getSgbd();
    setInterval(() =>{
        save(sgbd, modifiedDatabases);
        deleteFiles(deletedDatabases);
        clearModifiedDatabases();
        clearDeletedDatabases();
    }, period);
    console.log("cycle revolution...");
}

const pushToModifiedDatabases = (data) =>{
    modifiedDatabases.push(data);
}

const pushToDeletedMethods = (data) =>{
    deletedDatabases.push(data);
}

const clearModifiedDatabases = () =>{
    modifiedDatabases = [];
}

const clearDeletedDatabases = () =>{
    deletedDatabases = [];
}



exports.save     = save;
exports.loadData = loadData;
exports.startCycle = startCycle;
exports.pushToModifiedDatabases = pushToModifiedDatabases;
exports.pushToDeletedMethods = pushToDeletedMethods;

