const crypto = require('crypto');

const host = '127.0.0.1';
const post = 5000;

const sgbd = {}

const regex = /^((?:-?\d+(?:\.\d+)?)|(?:[^=><!]+))((?:=|!=|>|<|>=|<=)(?=\d)(?!\1)[^=><!]+|(?:=|!=)(?!\d)[^=><!]+)?$/;

//POST
const createDatabase = (name) =>{
    if(!sgbd.hasOwnProperty(name)){
        sgbd[name] = {};
    }else{
        throw new Error(`Database ${name} already exists !`);
    }
}

//POST
const createCollection = (dbName, collectionName) =>{

    if(sgbd.hasOwnProperty(dbName)){

        if(!sgbd[dbName].hasOwnProperty(collectionName)){

            sgbd[dbName][collectionName] = {};

        }else{

            throw new Error(`Collection ${collectionName} already exists !`);
        }

    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
};

//POST
const createDocument = (dbName, collectionName, data) =>{
    try{
        const id = generateId();
        sgbd[dbName][collectionName][id] = data;
    }catch(e){
        console.log(e.toString())
    }
};

//POST
const createDocuments = (dbName, collectionName, data) =>{
    try{
        data.forEach((obj) =>{
            const id = generateId();
            sgbd[dbName][collectionName][id] = obj;
        });
    }catch(e){
        console.log(e.toString());
    }
}

//GET
const getDatabases = () =>{
    try{
        var obj = {};
        var Keys = Object.keys(sgbd);
        obj.databases = Keys;
        return(obj);
    }catch(e){
        console.log(e.toString());
    }
}

//GET
const getCollections = (dbName) =>{
        if(sgbd.hasOwnProperty(dbName)){
            var obj = {};
            var Keys = Object.keys(sgbd[dbName]);
            obj.database = dbName;
            obj.collections = Keys
            return(obj);
        }else{
            throw new Error("database doesn't exists");
        }
}

//GET
const getDocuments = (dbName, collectionName) =>{
        if(sgbd.hasOwnProperty(dbName)){
            if(sgbd[dbName].hasOwnProperty(collectionName)){
                var obj = {};
                obj.database = dbName;
                obj.collection = collectionName;
                obj.documents = sgbd[dbName][collectionName];
                return(obj);
            }else{
                throw new Error("collection doesn't exists");
            }
        }else{
            throw new Error("database doesn't exists");
        }
}

//GET
const getDocumentById = (dbName, collectionName, idDoc) =>{
    if(sgbd.hasOwnProperty(dbName)){
        if(sgbd[dbName].hasOwnProperty(collectionName)){
            if(sgbd[dbName][collectionName].hasOwnProperty(idDoc)){
                var obj = {};
                obj.database = dbName;
                obj.collection = collectionName;
                obj.document = sgbd[dbName][collectionName][idDoc];
                return(obj);
            }else{
                throw new Error("document doesn't exists");
            }
        }else{
            throw new Error("collection doesn't exists");
        }
    }else{
        throw new Error("database doesn't exists");
    }
}

//GET
// le paramètre condition est l'expression spécifiant les critère de selection des documents 
const selectDocument = (dbName, collectionName, expressions) =>{
    expressions = queryReformat(expressions);
    if(sgbd.hasOwnProperty(dbName)){
        if(sgbd[dbName].hasOwnProperty(collectionName)){
            conditions = expressions.split('&');

            var results = [];

            const operators = [">=", "<=",">", "<", "!=", "="];
            let operator = "";
            let property = "";
            let value = "";

            conditions.map((condition) =>{
                if(regex.test(condition)){

                
                    // Recherche de l'opérateur dans l'expression
                    for(let i = 0; i < operators.length; i++){
                        if(condition.includes(operators[i])){
                            operator = operators[i];
                            break;
                        }
                    }

                    // Recupération de la condition et de sa valeur
                    property = condition.split(operator)[0];
                    value     = condition.split(operator)[1];
                    if(results.length == 0){
                        const database = sgbd[dbName][collectionName];
                        switch(operator){
                            case '=' :
                                Object.keys(database).forEach((key, index) =>{
                                    if(database[key][property] == value){
                                        results.push(database[key]);
                                    }
                                });
                                break;
                            case '>' :
                                Object.keys(database).forEach((key, index) =>{
                                    if(database[key][property] > value){
                                        results.push(database[key]);
                                    }
                                });
                                break;
                            case '<' : 
                                Object.keys(database).forEach((key,index) =>{
                                    if(database[key][property] > value){
                                        results.push(database[key]);
                                    }
                                });
                                break;
                            case '>=' : 
                                Object.keys(database).forEach((key,index) =>{
                                    if(database[key][property] >= value){
                                        results.push(database[key]);
                                    }
                                });
                                break;
                            case '<=' : 
                                Object.keys(database).forEach((key,index) =>{
                                    if(database[key][property] >= value){
                                        results.push(database[key]);
                                    }
                                });
                                break;
                            case '!=' : 
                                Object.keys(database).forEach((key,index) =>{
                                    if(database[key][property] != value){
                                        results.push(database[key]);
                                    }
                                });
                                break;              
                        }
                    }else{
                        switch(operator){
                            case '=' :
                                for(let i = results.length -1; i >= 0; i-- ){
                                    if(!(results[i][property] == value)){
                                        results.splice(i, 1);
                                    }
                                }                              
                                break;
                            case '>' :
                                for(let i = results.length -1; i >= 0; i-- ){
                                    if(!(results[i][property] > value)){
                                        results.splice(i, 1);
                                    }
                                }    
                                break;
                            case '<' :
                                for(let i = results.length -1; i >= 0; i-- ){
                                    if(!(results[i][property] < value)){
                                        results.splice(i, 1);
                                    }
                                }                                    
                                break;
                            case '>=' : 
                                for(let i = results.length -1; i >= 0; i-- ){
                                    if(!(results[i][property] >= value)){
                                        results.splice(i, 1);
                                    }
                                }    
                                break;
                            case '<=' : 
                                for(let i = results.length -1; i >= 0; i-- ){
                                    if(!(results[i][property] <= value)){
                                        results.splice(i, 1);
                                    }
                                }    
                                break;
                            case '!=' : 
                                for(let i = results.length -1; i >= 0; i-- ){
                                    if(!(results[i][property] != value)){
                                        results.splice(i, 1);
                                    }
                                }   
                                break;              
                        }
                    }

                }else{
                    throw new Error(`l'expression conditionnelle ${condition} est mal formée`);
                }
            });
            return results;
        }else{
            throw new Error(`collection ${collectionName} doesn't exists`);
        }
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
}

//PUT
const updateDatabaseName = (dbName, newName) =>{
    if(sgbd.hasOwnProperty(dbName)){
        sgbd[newName] = sgbd[dbName];
        delete(sgbd[dbName]);
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }   
}

//PUT
const updateCollectionName = (dbName, collectionName, newCollectionName) =>{
    if(sgbd.hasOwnProperty(dbName)){
        if(sgbd[dbName].hasOwnProperty(collectionName)){
            sgbd[dbName][newCollectionName] = sgbd[dbName][collectionName];
            delete(sgbd[dbName][collectionName]);
        }else{
            throw new Error(`collection ${collectionName} doesn't exists`);
        }
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
}

//PUT
const updateDocument = (dbName, collectionName, idDoc, data) =>{
    if(sgbd.hasOwnProperty(dbName)){
        if(sgbd[dbName].hasOwnProperty(collectionName)){
            if(sgbd[dbName][collectionName].hasOwnProperty(idDoc)){
                sgbd[dbName][collectionName][idDoc] = data;
            }else{
                throw new Error(`document ${idDoc} doesn't exists`);
            }
        }else{
            throw new Error(`collection ${collectionName} doesn't exists`);
        }
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
         
}

//PUT
const updateDocumentAttribute = (dbName, collectionName, idDoc, attributeName, value) =>{
        if(sgbd.hasOwnProperty(dbName)){
            if(sgbd[dbName].hasOwnProperty(collectionName)){
                if(sgbd[dbName][collectionName].hasOwnProperty(idDoc)){
                    if(sgbd[dbName][collectionName][idDoc].hasOwnProperty(attributeName)){
                        sgbd[dbName][collectionName][idDoc][attributeName] = value
                    }else{
                        throw new Error(`document ${idDoc} have no property named ${attributeName}`);
                    }
                }else{
                    throw new Error(`document ${idDoc} doesn't exists`);
                }
            }else{
                throw new Error(`collection ${collectionName} doesn't exists`);
            }
        }else{
            throw new Error(`database ${dbName} doesn't exists`);
        }
}

//PUT
const deleteDocumentAttribute = (dbName, collectionName, idDoc, attributeName) =>{
        var obj = getDocumentById(dbName, collectionName, idDoc);
        delete(obj[attributeName]);
        updateDocument(dbName, collectionName, idDoc, obj);
}

//DELETE
const deleteDatabase = (dbName) =>{
    if(sgbd.hasOwnProperty(dbName)){
        delete(sgbd[dbName]);
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
    
}

//DELETE 
const deleteCollection = (dbName, collectionName) =>{
    if(sgbd.hasOwnProperty(dbName)){
        if(sgbd[dbName].hasOwnProperty(collectionName)){
            delete(sgbd[dbName][collectionName]);
        }else{
            throw new Error(`collection ${collectionName} doesn't exists`);
        }
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
    
}

//DELETE 
const deleteDocument = (dbName, collectionName, idDoc) =>{
    if(sgbd.hasOwnProperty(dbName)){
        if(sgbd[dbName].hasOwnProperty(collectionName)){
            if(sgbd[dbName][collectionName].hasOwnProperty(idDoc)){
                delete(sgbd[dbName][collectionName][idDoc]);
            }else{
                throw new Error(`document ${idDoc} doesn't exists`);
            }
        }else{
            throw new Error(`collection ${collectionName} doesn't exists`);
        }
    }else{
        throw new Error(`database ${dbName} doesn't exists`);
    }
    
}

//Génère un id aléatoire
const generateId = () =>{
    const id = crypto.randomBytes(16).toString("hex");
    return(id);
}

//Retourne l'instance du SGBD
const getSgbd = () =>{
    return sgbd;
}

//Reformate la requete 
const queryReformat = (chaine) =>{
    const newString = chaine.replace(/=\&/g, "&");
    return newString;
}

exports.getDatabases            = getDatabases;
exports.createDatabase          = createDatabase;
exports.getCollections          = getCollections
exports.getDocuments            = getDocuments;
exports.getDocumentById         = getDocumentById;
exports.selectDocument          = selectDocument;
exports.createCollection        = createCollection;
exports.createDocument          = createDocument;
exports.updateDatabaseName      = updateDatabaseName;
exports.updateCollectionName    = updateCollectionName;
exports.updateDocument          = updateDocument;
exports.updateDocumentAttribute = updateDocumentAttribute;
exports.deleteDocumentAttribute = deleteDocumentAttribute;
exports.deleteDatabase          = deleteDatabase;
exports.deleteCollection        = deleteCollection;
exports.deleteDocument          = deleteDocument;
exports.getSgbd                 = getSgbd;
exports.createDocuments         = createDocuments;


