const {getSgbd} = require("./utils.js");

const {startCycle,
       loadData,
    } = require('./savingSystem.js');

const {
        GetMethod,
        PostMethod,
        PutMethod,
        DeleteMethod,
        OptionMethod
} = require('./methods.js');

const chemin = "./maintenence/"
const http = require('http');

const port = 8000;
const host = '127.0.0.1';

const handleServer = (req, res) =>{
    try{
        if(req.method == 'GET'){

           GetMethod(req, res);

        }else if(req.method == 'POST'){

           PostMethod(req, res);

        }else if (req.method == 'PUT'){

            PutMethod(req, res);

        }else if(req.method == 'DELETE'){

            DeleteMethod(req, res);

        }else if(req.method == 'OPTIONS'){
            
            OptionMethod(req, res);
        }

    } catch(e){
        console.log(e.toString());
        res.statusCode = 404;
        res.end(`{messsage: "${e.toString()}"}`);
    }
}

//Chargement des données en mémpoire
var sgbd = getSgbd();
loadData(chemin,sgbd);


const server = http.createServer(handleServer);
server.listen(port, host, () =>{
    console.log(`Server is running at http://${host}:${port}/`)
})

//
startCycle();