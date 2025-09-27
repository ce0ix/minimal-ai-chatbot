import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body || {}
  const lastUser = Array.isArray(messages) && messages.length
    ? messages[messages.length - 1].content
    : ''

  const mockReply = `Echo: ${lastUser}`

  if (process.env.OPENAI_API_KEY && lastUser) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            ...messages
          ],
          max_tokens: 300
        })
      })
      const j = await resp.json()
      const text = j?.choices?.[0]?.message?.content || mockReply
      return res.json({ reply: text })
    } catch (err) {
      console.error('OpenAI error', err)
      return res.json({ reply: mockReply })
    }
  }

  res.json({ reply: mockReply })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))
