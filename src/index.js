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

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json()); // allows to send metadata to the header


app.use("/content", express.static(path.join(__dirname, "public"))); //allows for static content from the html to be seen on localhost:8080/content


app.get("/", (_, res) => {
  // res.header("Content-Type", "application/html"); doesn't work when this is commented in
  res.status(200);
  res.sendFile("/public/index.html", { root: __dirname });
  
});


app.get('/todos', (_, res) => {
  res.header("Content-Type", "application/json");
  res.status(200);
  res.sendFile(todoFilePath, { root: __dirname });
});


//Add GET request with path '/todos/overdue'
app.get("/todos/overdue", (req, res) => {
  res.header("Content-Type", "application/json");                                                       //never have space between the / otherwise it won't work
   
  const date = new Date('29 January 2022 18:09 UTC')
                                                                                                             //  console.log(date.toISOString()) -works

  const overDueTodo = todos.filter((todo) => date.toISOString() > todo.due && todo.completed === false); //if the current date is greater than the todo due date and not completed return this 
                                                                                                           // console.log(overDueTodo) //- //works shows the array overdue
             res.send(overDueTodo);
             res.status(200);
  
     }
);
  
  


//Add GET request with path '/todos/completed'
app.get ("/todos/completed", (req, res) => {

res.header("Content-Type", "application/json");
     
const completedTodo = todos.filter((todo) => todo.completed === true);              //filter method will bring all the data that matches the condition however if you use the .find it only shows the first data that matches and not the rest.

   res.send(completedTodo); 
   res.status(200);     

});





// ********NOT PASSING TEST******* 
//Add POST request with path '/todos'
//Add a new todo to the todo list 

app.post("/todos", (req, res) => {
  const newTodo = req.body;

  // in the request body it should specifiy the due and name because the code without if statements allows for all todos to be created regardless of if the attribute is there.
  // name and due are keys of req.body (request body)
  // if (["name", "due"] !== Object.keys(newTodo)) {
  if (newTodo.name === undefined || newTodo.due === undefined) {
    res.status(400);
    res.send("Incorrect data submitted");

  } else {
    newTodo.completed = false
    newTodo.created = new Date().toISOString()

    const newTodosArray = [...todos, newTodo];
    //instead of modifying the current this creates a new array

    fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(newTodosArray))               //json.stringify changes the context to a string that json can read

    res.status(201);
    res.send("Created new Todo");  
  }   
});






// Add GET req with '/todos/:id'
app.get("/todos/:id", (req,res) => {                                     //parameter always has a : in front of it then followed by the name
res.header("Content-Type", "application/json"); 
      
const id = req.params.id;                                                //  console.log("the first todo id: ", req.params.id); - checking to see if it returns
const foundTodo = todos.find((todo) => todo.id == id);                   //.find()- it will return one object that matches the criteria i am passing through, the .find must have a condition to it otherwise nothing is returned. 

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
app.patch("/todos/:id", (req, res) => {
  const id = req.params.id
  const attributes = req.body

  const UpdatedTodo = todos.find((todo) => todo.id === id);                 //id, attributes, todos.name


  if (UpdatedTodo) {                                                       //if updatedTodo is different from undefined (true) then proceed with the if statements otherwise show the else statement.
      if (attributes.name !== undefined) {                                 //if the name is not given in the patch request in postman then show undefined in the terminal. If it is given then update the name in postman  
        UpdatedTodo.name = attributes.name                                 // if attributes.name is equal then set it 
      }
      if (attributes.due !== undefined) {                                  // due date is undefined because its not coming in the request body (attributes)
        UpdatedTodo.due = attributes.due
      }

    fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(todos))          //first argument is the path and the second is the content

    res.status(200);
    res.send(UpdatedTodo);

  } 
  else {
                                                                            // if UpdatedTodo is undefined, i.e., does not exit with that id
    res.status(400);
    res.send("That todo does not exist");
  }

})






//Add POST request with path '/todos/:id/complete
//PUT and POST methoud allows for updating exsisting data 

app.post("/todos/:id/complete", (req, res) => {
   const id = req.params.id
   const CompleteTodo = todos.find((todo) => todo.id ==id);
  

  if(CompleteTodo){
        CompleteTodo.completed = true

        fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(todos))
        
        res.status(200);
        res.send(CompleteTodo)
    }
    
  else {
  
    res.status(400);
    res.send("Bad Request) if invalid id");
  }
})




//Add POST request with path '/todos/:id/undo
app.post("/todos/:id/undo", (req, res) => {
  const id = req.params.id
  
  const UndoTodo = todos.find((todo) => todo.id ==id);

 if(UndoTodo){
     UndoTodo.completed = false
 
     fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(todos))
     
     res.status(200);
     res.send(UndoTodo)
   }
   
 else {
                                                                           // if UpdatedTodo is undefined, i.e., does not exit with that id
   res.status(400);
   res.send("Bad Request) if invalid id");
 }
})




// Add DELETE request with path '/todos/:id
app.delete("/todos/:id", (req, res) => {
                                                                                  // console.log("this is a request id ", req.params.id);
  const id = req.params.id
                                                                                  // console.log(id)
  const todoexsists= todos.some(todo => todo.id === id)                          //.some() passes back true or false
                         
  if(todoexsists){ 
    const RemovedTodoFromCliet = todos.filter((todo) => todo.id !== id);         //Only return the id's from the json file that are not equal to the id being called by the client. 
    console.log(todosAbsoluteFilePath)
    fs.writeFileSync(todosAbsoluteFilePath, JSON.stringify(RemovedTodoFromCliet), err => {
      if (err) {
        console.error(err)
        return
      }}); 
      res.header("Content-Type", "application/json"); 
      res.status(200).end();
    } 
  else {  
    res.status(400).end();
  }   
});



app.listen(PORT, function () {
    console.log(`Node server is running... http://localhost:${PORT}`);
});

module.exports = app;