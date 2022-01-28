require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const PORT = 8080; //true constant that doesn't change that's why port is in uppercase
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); //creates unique ids
const todoFilePath = process.env.BASE_JSON_PATH;
const todosAbsoluteFilePath = __dirname + todoFilePath;


//Read todos from todos.json into variable
let todos = require(todosAbsoluteFilePath); //the array of objects

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json()); // allows to send metadata to the header

app.use("/content", express.static(path.join(__dirname, "public"))); //allows for static content from the html to be seen on localhost:8080/content

app.get("/", (_, res) => {
  res.header("Content-Type", "application/html")
  res.status(200);
  res.sendFile("/public/index.html", { root: __dirname });
  
});

app.get('/todos', (_, res) => {
  res.header("Content-Type", "application/json");
  res.status(200);
  res.sendFile(todoFilePath, { root: __dirname });
});

app.get("/todos/:id", (req,res) => {                              //parameter always has a : in front of it then followed by the name
 
      const id = req.params.id;                                 //  console.log("the first todo id: ", req.params.id); - checking to see if it returns
      const foundTodo = todos.find((todo) => todo.id == id);   //.find()- it will return one object that matches the criteria i am passing through, the .find must have a condition to it otherwise nothing is returned. 

        if(foundTodo){
           res.header("Content-Type", "application/json"); 
           
           res.status(200)
           res.send(foundTodo);
         } 
         else{
           res.status(404).end();
           res.send("No todo found");
         }                                                  
});

//Add GET request with path '/todos/overdue'
app.get("/todos/overdue", (req, res) => {
  const date = getDate()
  //const month = getMonth()
  const overDueTodo = todos.find((todo) => date > todo.due)
    res.header("Content-Type", "application/ json"); 
    res.status(200)
    res.send(overDueTodo);
    
   }
);

//Add GET request with path '/todos/completed'
app.get ("/todos/completed", (_, res) => {
    const currentDate = getDate()
    const completedTodo = todos.find((todo) => currentDate > todo.due && todo.completed === true);
    res.header("Content-Type", "application/ json");
    
   //do i need res.sendFile(todoFilePath, { root: __dirname }); here??????

    res.status(200);
    res.send(completedTodo); 
});


//Add POST request with path '/todos'
//Add a new todo to the todo list 
app.post("/todos", (req, res) => {
      // console.log("New add: ", req.body); - shows added array in the terminal 
      const newTodo = req.body;
      // console.log("old todos", todos); 

      const newTodosArray = [...todos, newTodo]; //instead of modifying the current this creates a new array
  
 fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(newTodosArray))





});



//Add PATCH request with path '/todos/:id


//Add POST request with path '/todos/:id/complete


//Add POST request with path '/todos/:id/undo


//Add DELETE request with path '/todos/:id

app.listen(PORT, function () {
    console.log(`Node server is running... http://localhost:${PORT}`);
});

module.exports = app;