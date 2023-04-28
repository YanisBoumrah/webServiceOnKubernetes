const {
    getDatabases, 
    createDatabase, 
    getCollections,
    getDocuments,
    getDocumentById,
    selectDocument,
    createCollection,
    createDocument,
    updateDatabaseName,
    updateCollectionName,
    updateDocument,
    updateDocumentAttribute,
    deleteDocumentAttribute,
    deleteDatabase,
    deleteCollection,
    deleteDocument,
    createDocuments

} = require("./utils.js");

const {pushToModifiedDatabases, pushToDeletedMethods} = require("./savingSystem.js");

const http = require('http');
const url = require('url');
const path = require("path");


const GetMethod = (req, res) =>{
    if(req.url === '/'){
        //Récupération de la liste des bases de données
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.writeHead(200,{'Content-Type': 'application/json'});
        var results = getDatabases();
        res.end(JSON.stringify(results));
    }else{
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        // Créer un objet URL personnalisé sans l'host et le port
        const urlObj = {
            pathname: pathname,
            query: query,
        };

        // Créer une chaîne avec l'URL complète sans l'host et le port
        var urlStr = decodeURIComponent(url.format(urlObj))
        if(urlStr.charAt(urlStr.length -1) == '='){
            urlStr = urlStr.slice(0, -1);
        }
        //Gestion de l'import ddes symboles '>' et '<'
        // urlStr = urlStr.replace("%3E", ">");
        // urlStr = urlStr.replace("%3C", "<");
        const pathQueries = {};
        pathQueries.path = urlStr.split('?')[0];
        pathQueries.query = urlStr.split('?')[1];

        if(pathQueries.path){
            const pathArray = pathQueries.path.split('/').filter(Boolean);
            if(pathArray.length == 1){
                //Récupération de la liste des collections
                const dbName = pathArray[0];
                var results = getCollections(dbName);
                if(results){
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                        res.writeHead(200,{'Content-Type': 'application/json'});
                        res.end(JSON.stringify(results));
                }
            }else if(pathArray.length == 2){
                        if(!pathQueries.query){
                            //Récupération des documents d'une base donnée
                            const dbName = pathArray[0];
                            const collectionName = pathArray[1];
                            var results = getDocuments(dbName, collectionName);
                            if(results){
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                                res.writeHead(200,{'Content-Type': 'application/json'});
                                res.end(JSON.stringify(results));
                            }
                        }else{
                            //Recherche d'un document
                            const dbName = pathArray[0];
                            const collectionName = pathArray[1];
                            const expression = pathQueries.query;
                            console.log(`l'expression: ${expression}`);
                            var results = selectDocument(dbName,collectionName,expression);
                            if(results){
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                                res.writeHead(200,{'Content-Type': 'application/json'});
                                res.end(JSON.stringify(results));
                            }
                        }
                    }else if(pathArray.length == 3){
                        //Récupération d'un document en fonction de son id
                        const dbName = pathArray[0];
                        const collectionName = pathArray[1];
                        const idDoc = pathArray[2];
                        var results = getDocumentById(dbName,collectionName,idDoc);
                        if(results){
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                            res.writeHead(200,{'Content-Type': 'application/json'});
                            res.end(JSON.stringify(results));
                        }
                    }
            }
        }
};


const PostMethod = (req, res) =>{
    if(req.url === '/'){
        //Creation d'une base de donnée
        var body = "";
        req.on('data', (data) =>{
            body += data.toString();
        });
        req.on('end', () =>{
            try{
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.writeHead(200,{'Content-Type': 'application/json'});
                const db = JSON.parse(body);
                createDatabase(db.dbName);
                const message = `{database ${db.dbName} is created}`;
                //pour la sauvegarde
                pushToModifiedDatabases(db.dbName);
                res.end(JSON.stringify(message));
            }catch(e){
                console.log(e.toString());
                res.statusCode = 404;
                res.end(`{messsage: "${e.toString()}"}`);
            } 
        });
    }else{
        const pathname = url.parse(req.url,true).pathname;
        const pathArray = pathname.split('/').filter(Boolean);
        if(pathArray.length == 1){
            //Création d'une collection
            const dbName = pathArray[0];
            var body = '';
            req.on('data', (data) =>{
                body += data.toString();
            });
            req.on('end', () =>{
                try{
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                    res.writeHead(200,{'Content-Type': 'application/json'});
                    const collection = JSON.parse(body);
                    createCollection(dbName, collection.collectionName);
                    //pour la sauvegarde
                    pushToModifiedDatabases(dbName);
                    message = `{collection ${collection.collectionName} is created}`;
                    res.end(JSON.stringify(message));
                }catch(e){
                    console.log(e.toString());
                    res.statusCode = 404;
                    res.end(`{messsage: "${e.toString()}"}`);
                }
            });
        }else if(pathArray.length == 2){
            //Création d'un document
            const dbName = pathArray[0];
            const collectionName = pathArray[1];
            var body = '';
            req.on('data', (data) =>{
                body += data;
            });
            req.on('end', ()=>{
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.writeHead(200,{'Content-Type': 'application/json'});
                const document = JSON.parse(body);
                createDocument(dbName,collectionName,document);
                pushToModifiedDatabases(dbName);
                message = `{Docuement created}`;                        
                res.end(JSON.stringify(message));
            });
        }else if(pathArray.length == 3){
            if(pathArray[2] == 'masse'){
                //Insertion en masse
                const dbName = pathArray[0];
                const collectionName = pathArray[1];
                var body = '';
                req.on('data', (data) =>{
                    body += data;
                });
                req.on('end', () =>{
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                    res.writeHead(200,{'Content-Type': 'application/json'});
                    const documents = JSON.parse(body);
                    createDocuments(dbName, collectionName, documents);
                    pushToModifiedDatabases(dbName);
                    message = `{Documents created !}`;                        
                    res.end(JSON.stringify(message));
                });
            }else{
                message = `Error: wrong request`;
                res.writeHead(404,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(message));
            }
        }

    }
};


const PutMethod = (req, res) =>{
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const query = parsedUrl.query;

            // Créer un objet URL personnalisé sans l'host et le port
            const urlObj = {
                pathname: pathname,
                query: query,
            };

            // Créer une chaîne avec l'URL complète sans l'host et le port
            const urlStr = url.format(urlObj);
                const pathQueries = {};
                pathQueries.path = urlStr.split('?')[0];
                pathQueries.query = urlStr.split('?')[1];
                console.log(`pathQueries: ${pathQueries.query}`);
                if(pathQueries.path){
                    const pathArray = pathname.split('/').filter(Boolean);
                    if(pathArray.length == 1){
                        //Mise à jours du nom d'une base de donnés
                        const dbName = pathArray[0];
                        var body = '';
                        req.on('data', (data) =>{
                            body += data;
                        });
                        req.on('end', () =>{
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                            res.writeHead(200,{'Content-Type': 'application/json'});
                            const newDb = JSON.parse(body);
                            updateDatabaseName(dbName, newDb.newName);
                            //Pour la sauvegarde
                            pushToModifiedDatabases(dbName);
                            message = `{Database updated}`;
                            res.end(JSON.stringify(message));
                        });
                    }else if(pathArray.length == 2){
                        //MAJ du nom d'une collection
                        const dbName = pathArray[0];
                        const collectionName = pathArray[1];
                        var body = '';
                        req.on('data', (data) =>{
                            body += data;
                        });
                        req.on('end', () =>{
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                            res.writeHead(200,{'Content-Type': 'application/json'});
                            const newCollection = JSON.parse(body);
                            updateCollectionName(dbName,collectionName, newCollection.newCollectionName);
                            //pour la sauvegarde
                            pushToModifiedDatabases(dbName);
                            message = `{Collection Updated}`;
                            res.end(JSON.stringify(message));

                        });
                    }else if(pathArray.length == 3){
                        //MAJ d'un document à partir de son ID
                        const dbName = pathArray[0];
                        const collectionName = pathArray[1];
                        const idDoc = pathArray[2];
                        if(!pathQueries.query){
                            var body = '';
                            req.on('data', (data) =>{
                                body += data;
                            });
                            req.on('end', () =>{
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                                res.writeHead(200,{'Content-Type': 'application/json'});
                                const newDoc = JSON.parse(body);
                                updateDocument(dbName,collectionName, idDoc, newDoc);
                                //pour la sauvegarde
                                pushToModifiedDatabases(dbName);
                                res.end(JSON.stringify(newDoc));
                            });
                        }else{
                            console.log("renté !!!");
                            //MAJ d'un attribut dans un document
                            const attribute = pathQueries.query.split('=')[0];
                            const value = pathQueries.query.split('=')[1];
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            updateDocumentAttribute(dbName, collectionName, idDoc, attribute, value);
                            //pour la sauvegarde
                            pushToModifiedDatabases(dbName);
                            const message = `{Parameter updated}`;
                            res.end(JSON.stringify(message));
                        }
                    }else if(pathArray.length == 4){
                        //Suppression d'un attribut d'un document
                        const dbName = pathArray[0];
                        const collectionName = pathArray[1];
                        const idDoc = pathArray[2];
                        const attribute = pathArray[3];
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                        res.writeHead(200,{'Content-Type': 'application/json'});
                        deleteDocumentAttribute(dbName, collectionName, idDoc, attribute);
                        //pour la sauvegarde
                        pushToModifiedDatabases(dbName);
                        const message = `{Attribute deleted}`;
                        res.end(JSON.stringify(message));
                    }
                }
};


const DeleteMethod = (req, res) =>{
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Créer un objet URL personnalisé sans l'host et le port
    const urlObj = {
        pathname: pathname,
        query: query,
    };

    const urlStr = url.format(urlObj);
    const pathQueries = {};
    pathQueries.path = urlStr.split('?')[0];
    pathQueries.query = urlStr.split('?')[1];

    if(pathQueries.path){
        const pathArray = pathname.split('/').filter(Boolean);
        if(pathArray.length == 1){
            //Suppression d'une database
            try{
                const dbName = pathArray[0];
                deleteDatabase(dbName);
                //pour la sauvegarde
                pushToDeletedMethods(dbName);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.writeHead(200,{'Content-Type': 'application/json'});
                const message = `{database deleted}`
                res.end(JSON.stringify(message));
            }catch(e){
                console.log(e.toString());
                res.statusCode = 404;
                res.end(`{messsage: "${e.toString()}"}`);
            }
            
        }else if(pathArray.length == 2){
            //Suppression d'une collection
            try{
                const dbName = pathArray[0];
                const collectionName = pathArray[1];
                deleteCollection(dbName, collectionName);
                //pour la sauvegarde
                pushToModifiedDatabases(dbName);
                const message = `{collection deleted}`;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.end(JSON.stringify(message));
            }catch(e){
                console.log(e.toString());
                res.statusCode = 404;
                res.end(`{messsage: "${e.toString()}"}`);
            }
        }else if(pathArray.length == 3){
            //Suppression d'un document
            try{
                const dbName = pathArray[0];
                const collectionName = pathArray[1];
                const idDoc = pathArray[2];
                deleteDocument(dbName, collectionName, idDoc);
                //pour la sauvegarde
                pushToModifiedDatabases(dbName);
                const message = `{document deleted}`;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.end(JSON.stringify(message));
            }catch(e){
                console.log(e.toString());
                res.statusCode = 404;
                res.end(`{messsage: "${e.toString()}"}`);
            }
        }
    }
};

const OptionMethod = (req, res) =>{
    if(req.url === '/'){
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.writeHead(200);
        res.end();
    }else{
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        // Créer un objet URL personnalisé sans l'host et le port
        const urlObj = {
            pathname: pathname,
            query: query,
        };

        // Créer une chaîne avec l'URL complète sans l'host et le port
        var urlStr = decodeURIComponent(url.format(urlObj))
        if(urlStr.charAt(urlStr.length -1) == '='){
            urlStr = urlStr.slice(0, -1);
        }
        //Gestion de l'import ddes symboles '>' et '<'
        // urlStr = urlStr.replace("%3E", ">");
        // urlStr = urlStr.replace("%3C", "<");
        const pathQueries = {};
        pathQueries.path = urlStr.split('?')[0];
        pathQueries.query = urlStr.split('?')[1];

        if(pathQueries.path){
            const pathArray = pathQueries.path.split('/').filter(Boolean);
            if(pathArray.length == 1){
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.writeHead(200);
                res.end();
            }else if(pathArray.length == 2){
                        if(!pathQueries.query){
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');   
                                res.writeHead(200);
                                res.end();      
                        }else{
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                                res.writeHead(200);
                                res.end();
                        }
                    }else if(pathArray.length == 3){
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                            res.writeHead(200);
                            res.end();
                    }
            }
        }
}

exports.GetMethod = GetMethod;
exports.PostMethod = PostMethod;
exports.PutMethod = PutMethod;
exports.DeleteMethod = DeleteMethod;
exports.OptionMethod = OptionMethod;