const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3001;
const cors = require("cors");

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

const path = require("path")
const pathToFile = path.resolve("./data.json");

const getResources = () => JSON.parse(fs.readFileSync(pathToFile).toString())


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.get("/api/resources", (req, res) => {
    const resources = getResources()
    res.send(resources)
})


app.get("/api/activeresources", (req, res) => {
    const resources = getResources()
    const activeResource = resources.find(resource => resource.status === "active") 
    res.send(activeResource)
})

app.get("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const resourceId = req.params.id
    const resource = resources.find(resource => resource.id === resourceId)
    res.send(resource)
})

app.patch("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const { id } = req.params;
    const index = resources.findIndex(resource => resource.id === id );
    const activeResource = resources.find(resource => resource.status === "active" ) 


    if(resources[index].status === "complete"){
        return res.status(500).send("Cannot update because resource has been completed!");    
    }

    resources[index] = req.body
    
    if(req.body.status === "active") {
        
        if(activeResource){
            return res.status(500).send("There is active resource already!");    
        }
        console.log("can")
        resources[index].status = "active";
        resources[index].activationTime = new Date()
    }


    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if(error){
            return res.status(422).send("Cannot store data in the file!");
        }
        return res.send("Data has been saved!");
    })
})

// app.patch("/api/resources/:id", (req, res) => {
//     const resources = getResources();
//     const { id } = req.params;
//     const index = resources.findIndex(resource => resource.id === id);
  
//     resources[index] = req.body;
  
//     fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
//       if (error) {
//         return res.status(422).send("Cannot store data in the file!");
//       }
  
//       return res.send("Data has been updated!");
//     })
//   })

app.post("/api/resources", (req, res) => {
    const resources = getResources()
    const resource = req.body;

    resource.createdAt = new Date();
    resource.status = "inactive"
    resource.id = Date.now().toString();
    resources.push(resource);

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if(error){
            return res.status(422).send("Cannot store data in the file!");
        }
        console.log("It works")
        return res.send("Data has been saved!");
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})