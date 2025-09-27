const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// Plugin system
const plugins = new Map()

// Load plugins from plugins directory
function loadPlugins() {
  const pluginsDir = path.join(__dirname, "plugins")

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir)
  }

  const pluginFiles = fs.readdirSync(pluginsDir).filter((file) => file.endsWith(".js"))

  pluginFiles.forEach((file) => {
    try {
      const plugin = require(path.join(pluginsDir, file))
      plugins.set(plugin.name.toLowerCase(), plugin)
      console.log(`✅ Plugin loaded: ${plugin.name}`)
    } catch (error) {
      console.error(`❌ Failed to load plugin ${file}:`, error.message)
    }
  })
}

// Generate Swagger documentation
function generateSwaggerDoc() {
  const paths = {}

  plugins.forEach((plugin, name) => {
    const endpoint = `/api/${name}`
    const parameters = plugin.params.map((param) => ({
      name: param,
      in: "query",
      required: true,
      schema: { type: "string" },
      description: `Parameter ${param} untuk ${plugin.desc}`,
    }))

    paths[endpoint] = {
      get: {
        tags: [plugin.category || "General"],
        summary: plugin.desc,
        description: `${plugin.desc} - ${plugin.name}`,
        parameters,
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean" },
                    meta: { type: "object" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
          },
        },
      },
    }
  })

  return {
    openapi: "3.0.0",
    info: {
      title: "REST API with Plugin System",
      version: "1.0.0",
      description: "REST API dengan sistem plugin yang dapat diperluas",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    paths,
  }
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/api/docs", (req, res) => {
  res.json(generateSwaggerDoc())
})

app.get("/api/plugins", (req, res) => {
  const pluginList = Array.from(plugins.values()).map((plugin) => ({
    name: plugin.name,
    desc: plugin.desc,
    category: plugin.category,
    params: plugin.params,
    endpoint: `/api/${plugin.name.toLowerCase()}`,
  }))

  res.json({
    status: true,
    count: pluginList.length,
    plugins: pluginList,
  })
})

// Dynamic plugin routes
app.get("/api/:pluginName", async (req, res) => {
  const pluginName = req.params.pluginName.toLowerCase()
  const plugin = plugins.get(pluginName)

  if (!plugin) {
    return res.status(404).json({
      status: false,
      error: `Plugin '${pluginName}' tidak ditemukan`,
    })
  }

  try {
    await plugin.run(req, res)
  } catch (error) {
    console.error(`Error in plugin ${pluginName}:`, error)
    res.status(500).json({
      status: false,
      error: "Internal server error",
      message: error.message,
    })
  }
})

// Load plugins and start server
loadPlugins()

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}`)
  console.log(`🔌 Loaded ${plugins.size} plugins`)
})
