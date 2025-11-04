# Setup Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies

The dependencies are already installed. If you need to reinstall them:

```bash
npm install
```

### 2. Configure OpenAI API Key

You need an OpenAI API key to use this application.

#### Get an API Key:

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (you won't be able to see it again!)

#### Add to Environment:

Create a `.env.local` file in the root directory:

```bash
# In the project root
echo "OPENAI_API_KEY=your_actual_api_key_here" > .env.local
```

Or manually create `.env.local` with:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important**: Never commit `.env.local` to version control!

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Test Case

The app comes pre-configured with a default example. Just click **"Generate Reading Passage"** to test!

**Pre-filled defaults:**
- Topic: "AI and Cultural Memory"
- Domain: "science/philosophy"
- Level: C1
- Length: long (~1800 words)
- Side Box: Enabled
- All 12 question types selected

## Alternative Test Case

Try this urban design example:

1. **Topic**: `Quiet Revolutions in the City: Small Designs for Urban Heat`
2. **Domain**: `urban design / climate`
3. **Level**: `C1`
4. **Length**: `long`
5. **Side Box**: `YES`
6. **Question Types**: Select all or at least 5

## Troubleshooting

### Error: "Failed to generate reading passage"

**Cause**: Usually means the OpenAI API key is missing or invalid.

**Solutions**:
1. Check that `.env.local` exists in the root directory
2. Verify the API key is correct (should start with `sk-`)
3. Make sure you have credits/billing set up in your OpenAI account
4. Restart the development server after adding the key

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Error: Rate limit exceeded

**Cause**: You've hit OpenAI's API rate limits.

**Solutions**:
1. Wait a few minutes before trying again
2. Upgrade your OpenAI plan if you need higher limits
3. The app uses `gpt-4o` by default - you can change the model in `lib/llm.ts`

### Error: Module not found

**Cause**: Dependencies not installed properly.

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Model Configuration

The application uses **GPT-4o** by default. To change the model:

1. Open `lib/llm.ts`
2. Find the line: `model: "gpt-4o"`
3. Change to any OpenAI model you have access to:
   - `gpt-4o` (default, recommended)
   - `gpt-4-turbo`
   - `gpt-4`
   - `gpt-3.5-turbo` (faster but lower quality)

## API Rate Limits

Be aware of OpenAI's rate limits:
- Free tier: Limited requests per day
- Pay-as-you-go: Higher limits
- Enterprise: Custom limits

Each generation consumes tokens based on:
- System prompt (~500 tokens)
- User prompt (~200 tokens)
- Generated content (~2000-3000 tokens for long passages)

## Cost Estimation

Approximate cost per generation (with GPT-4o):
- Short passage: ~$0.02-0.03
- Medium passage: ~$0.03-0.05
- Long passage: ~$0.05-0.08

## Production Deployment

### Environment Variables

For production, set `OPENAI_API_KEY` in your hosting platform:

**Vercel:**
```bash
vercel env add OPENAI_API_KEY
```

**Netlify:**
Add in Site settings → Environment variables

**Railway/Render:**
Add in Dashboard → Environment

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify your OpenAI API key is active
4. Ensure you have sufficient credits

## Next Steps

Once everything works:
1. ✅ Test with the default example
2. ✅ Try the urban design example
3. ✅ Experiment with different topics
4. ✅ Export to PDF and DOCX
5. ✅ Check the quality scorecard
6. 🎯 Deploy to production!


