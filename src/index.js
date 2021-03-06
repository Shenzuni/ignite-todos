const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "Can't find username." })
  }

  request.user = user
  next()
}

app.post("/users", (request, response) => {
  const { name, username } = request.body

  const userExists = users.some((user) => user.username === username)

  if (userExists) {
    return response.status(400).json({ error: "User already exists." })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  }
  users.push(user)

  return response.status(201).json(user)
})

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { todos } = user

  return response.status(200).json(todos)
})

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todo = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    done: false,
    created_at: new Date(),
  }

  user.todos.push(todo)

  return response.status(201).send(todo)
})

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Todo doesn't exist." })
  }

  todo.title = title
  todo.deadline = deadline

  return response.status(201).json(todo)
})

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Todo doesn't exist." })
  }

  todo.done = true

  return response.status(201).json(todo)
})

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Todo doesn't exist." })
  }

  const indexTodo = user.todos.indexOf(todo)
  user.todos.splice(indexTodo, 1)

  return response.status(204).json()
})

module.exports = app
