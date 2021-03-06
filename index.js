require('dotenv').config()
const express = require('express')
const connect = require('./db')
const cors = require('cors')
const PORT = process.env.PORT || 8080
const { ApolloServer, gql } = require('apollo-server-express')
const app = express()
const fs = require('fs')
const path = require('path')
const {
  addRepository,
  getRepositories,
  getIssues,
  getLabels,
  getSpecificRepository
} = require('./controllers')

const schema = fs.readFileSync(path.resolve(__dirname, './models/issues.graphql'), 'utf-8')

const typeDefs = gql(schema)

const resolvers = {
  Query: {
    repositories: async () => {
      const data = await getRepositories()
      return data
    },
    issues: async (_, { pathname }) => {
      const data = await getIssues(pathname)
      return data.issues
    },
    label: async (_, { url }) => {
      const data = await getLabels(url)
      return data.issues
    },
    repository: async (_, { pathname }) => {
      const data = await getSpecificRepository(pathname)
      return data
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.applyMiddleware({ app })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/repository', async (req, res) => {
  const { url } = req.body

  if (!url) {
    res.status(400).json({ message: 'https://http.cat/400' })
  }

  addRepository(url)
    .then((issues) => {
      res.json({ message: 'Ok: 203' })
    })
    .catch((err) => {
      res.status(404).json({ message: 'https://http.cat/404' })
      res.status(503).json({ message: 'https://http.cat/503' })
      console.log(err)
    })
})

connect().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`running on ${PORT}`))
})
