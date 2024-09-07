const express = require('express')
const sqlite3 = require('sqlite3')
const app = express()
const {open} = require('sqlite')
app.use(express.json())
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initilizileIntoServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running on http://localhost/3000')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
initilizileIntoServer()
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const selectQuery = `
  SELECT
  *
  FROM
  todo
  WHERE id = ${todoId};
  `
  const dbUser = await db.get(selectQuery)
  response.send(dbUser)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const selectQuery = `
  INSERT INTO todo(id , todo , priority , status)
  VALUES(
    ${id},
    '${todo}',
    '${priority}',
    '${status}'
  );
  `
  await db.run(selectQuery)
  response.send('Todo Successfully Added')
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
  DELETE FROM todo
  WHERE id = ${todoId};
  `
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

const bodyStatus = obj => {
  return obj.status !== undefined
}
const bodyPriority = obj => {
  return obj.priority !== undefined
}
const bodytodo = obj => {
  return obj.todo !== undefined
}

app.put('/todos/:todoId/', async (request, response) => {
  const data = null
  const {status, priority, todo} = request.body
  const {todoId} = request.params
  let selectQuery = ''
  switch (true) {
    case bodyStatus(request.body):
      selectQuery = `
    UPDATE todo
    SET status = '${status}'
    WHERE id = ${todoId}
    `
      await db.run(selectQuery)
      response.send('Status Updated')
      break
    case bodyPriority(request.body):
      selectQuery = `
  UPDATE todo
  SET priority = '${priority}'
  WHERE id = ${todoId}
  `
      await db.run(selectQuery)
      response.send('Priority Updated')
      break
    case bodytodo(request.body):
      selectQuery = `
  UPDATE todo
  SET todo = '${todo}'
  WHERE id = ${todoId}
  `
      await db.run(selectQuery)
      response.send('Todo Updated')
      break
  }
})

module.exports = app
