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


// ******THIS WORKS *********
app.use("/content", express.static(path.join(__dirname, "public"))); //allows for static content from the html to be seen on localhost:8080/content


// *********THIS DOESN'T WORK- JSUT DOWNLOADS EMPTY TEXT FILE- postman says 200 ok? and shows html**********
app.get("/", (_, res) => {
  res.header("Content-Type", "application/html");
  res.status(200);
  res.sendFile("/public/index.html", { root: __dirname });
 
});


// ********THIS WORKS- SHOWS ARRAY**********
app.get('/todos', (_, res) => {
  res.header("Content-Type", "application/json");
  res.status(200);
  res.sendFile(todoFilePath, { root: __dirname });
});


// ***********WORKS***************
//Add GET request with path '/todos/overdue'
app.get("/todos/overdue", (req, res) => {
   res.header("Content-Type", "application/json"); //never have space between the / otherwise it won't work
     const date = new Date('29 January 2022 18:09 UTC')
    //  console.log(date.toISOString()) -works

    const overDueTodo = todos.find((todo) => date.toISOString() > todo.due && todo.completed === false); //if the current date is greater than the todo due date and not completed return this 
    // console.log(overDueTodo) //- //works shows the array overdue
             res.send(overDueTodo);
             res.status(200);
  
     }
);
  
  

// ******************WORKS*******************************
//Add GET request with path '/todos/completed'
app.get ("/todos/completed", (req, res) => {
  res.header("Content-Type", "application/json");
     
  // let currentDate = new Date('29 January 2022 18:09 UTC')
  const completedTodo = todos.filter((todo) => todo.completed === true);  //filter method will bring all the data that matches the condition however if you use the .find it only shows the first data that matches and not the rest.

    //  console.log(completedTodo) 
   res.send(completedTodo); 
   res.status(200);     

});



// ********THIS WORKS*******
//Add POST request with path '/todos'
//Add a new todo to the todo list 

app.post("/todos", (req, res) => {
      // console.log("New add: ", req.body); - shows added array in the terminal 
      const newTodo = req.body;
      // console.log("old todos", todos); 

      const newTodosArray = [...todos, newTodo]; //instead of modifying the current this creates a new array
  
  fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(newTodosArray)) //json.stringify changes the context to a string that json can read

  if(newTodosArray){
    res.header("Content-Type", "application/json"); 
    res.send("Created new Todo");
    res.status(201).end();
  } 
  else{  
    res.send("Incorrect data submitted");
    res.status(400).end();

  }   
});



// ************THIS WORKS****************
app.get("/todos/:id", (req,res) => {                              //parameter always has a : in front of it then followed by the name
    res.header("Content-Type", "application/json"); 
      const id = req.params.id;                                 //  console.log("the first todo id: ", req.params.id); - checking to see if it returns
      const foundTodo = todos.find((todo) => todo.id == id);   //.find()- it will return one object that matches the criteria i am passing through, the .find must have a condition to it otherwise nothing is returned. 

        if(foundTodo){
            res.send(foundTodo);
            res.status(200)
         } 
         else{
           res.status(404);
           res.send("No todo found");
         }                                                  
});



//Add PATCH request with path '/todos/:id



//Add POST request with path '/todos/:id/complete
// Update todo, set attribute complete to true
//PUT methoud allows for updating exsisting data 
app.post("/todos/:id/complete", (req, res) => {
   const id = req.params.id
   console.log(id)
   

})






//Add POST request with path '/todos/:id/undo









//  *****DOESN'T DELETE******
// Add DELETE request with path '/todos/:id
app.delete("/todos/:id", (req, res) => {
  // console.log("this is a request id ", req.params.id);
  const id = req.params.id

  const RemovedTodoFromCliet = todos.filter((todo) => todo.id !== id); //Only return the id's from the json file that are not equal to the id being called by the client. 
  // console.log("everything but learn todo", RemovedTodoFromCliet); 
  
  fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(RemovedTodoFromCliet));
  
  if(RemovedTodoFromCliet){
    // res.header("Content-Type", "application/json"); 
    res.status(200);
  } 
  else{  
    res.status(400);
  }   
});



app.listen(PORT, function () {
    console.log(`Node server is running... http://localhost:${PORT}`);
});

module.exports = app;