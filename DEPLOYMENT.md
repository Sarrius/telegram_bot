# 🚀 Telegram Bot Deployment Guide

This guide provides step-by-step instructions for deploying your advanced Telegram bot with NLP, sentiment analysis, meme generation, and atmosphere enhancement features.

## 📋 Prerequisites

- [Telegram Bot Token](https://core.telegram.org/bots#botfather)
- [Node.js 18+](https://nodejs.org/)
- Git account (GitHub, GitLab, etc.)
- Account on chosen deployment platform

## 🔧 Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Required
BOT_TOKEN=your_telegram_bot_token_here
PORT=3000

# Optional - for enhanced features
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password

# Production settings
NODE_ENV=production
```

## 🎯 Quick Deploy Options

### Option 1: Vercel (Recommended for beginners)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### Steps:
1. Fork this repository to your GitHub account
2. Install Vercel CLI: `npm i -g vercel`
3. Login to Vercel: `vercel login`
4. Deploy: `vercel --prod`
5. Set environment variables in Vercel dashboard
6. Your bot will be live at the provided URL!

#### Vercel Configuration:
- ✅ Automatic builds from Git
- ✅ Serverless functions
- ✅ Free tier available
- ✅ Custom domains supported

### Option 2: Render (Best for continuous deployment)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

#### Steps:
1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Choose "Web Service" type
4. Use the provided `render.yaml` configuration
5. Set environment variables in Render dashboard
6. Deploy automatically!

#### Render Configuration:
- ✅ Free tier with 750 hours/month
- ✅ Automatic deploys from Git
- ✅ Built-in health checks
- ✅ Zero-downtime deployments

### Option 3: Railway (Fastest setup)

#### Steps:
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Set environment variables: `railway variables set BOT_TOKEN=your_token`
5. Deploy: `railway up`

### Option 4: Heroku (Traditional)

#### Steps:
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-bot-name`
3. Set environment variables: `heroku config:set BOT_TOKEN=your_token`
4. Deploy: `git push heroku main`

## 🏗️ Manual Deployment

### Local Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd telegram_bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values

# Build the project
npm run build

# Start in development mode
npm run dev

# Or start in production mode
npm start
```

### VPS Deployment

For deploying on your own server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup your bot
git clone <your-repo-url>
cd telegram_bot
npm install
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## ⚙️ Platform-Specific Configuration

### Vercel Specific

Add to your `package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

### Render Specific

The `render.yaml` file is pre-configured. Key points:
- Health check endpoint: `/health`
- Auto-deploy from main branch
- Free tier limitations: sleeps after 15 min of inactivity

### Railway Specific

Create `railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

## 🔍 Health Monitoring

All deployment platforms can monitor your bot via the `/health` endpoint:

```
GET /health
Response: {
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "bot_active": true,
  "bot_username": "your_bot_username"
}
```

## 🎨 Feature Configuration

### NLP Features
- Uses Hugging Face Transformers (free tier)
- Automatic fallback to rule-based responses
- No additional API keys required

### Meme Generation
- Works without Imgflip (canvas-based fallback)
- For enhanced memes, set `IMGFLIP_USERNAME` and `IMGFLIP_PASSWORD`
- Free Imgflip account provides 100 memes/day

### Content Moderation
- Built-in inappropriate content detection
- Configurable sensitivity levels
- Custom forbidden words support

### Atmosphere Enhancement
- Automatic chat engagement
- User role assignment
- Dynamic polls and fun facts

## 🔧 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check `/health` endpoint
   - Verify BOT_TOKEN is correct
   - Check logs for errors

2. **Memes not generating**
   - Canvas dependencies might be missing
   - Check if IMGFLIP credentials are set
   - Verify image generation permissions

3. **Memory issues**
   - NLP models can be memory-intensive
   - Consider disabling features for free tiers
   - Monitor memory usage via platform dashboards

4. **Deployment failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies install correctly
   - Check build logs for specific errors

### Platform-Specific Issues

#### Vercel
- Function timeout (max 10s on free tier)
- Cold starts may cause delays
- Limited memory (1GB on free tier)

#### Render
- Sleeps after 15 min inactivity (free tier)
- 750 hours/month limit
- Automatic restart after crashes

#### Railway
- Credit-based billing
- May pause on free tier
- Good for development/testing

### Performance Optimization

```javascript
// Disable heavy features for free tiers
const config = {
  enableNLP: process.env.ENABLE_NLP !== 'false',
  enableMemeGeneration: process.env.ENABLE_MEMES !== 'false',
  enableAtmosphereEnhancement: process.env.ENABLE_ATMOSPHERE !== 'false'
};

// Adjust memory usage
process.env.NODE_OPTIONS = '--max-old-space-size=512';
```

## 📊 Monitoring and Analytics

### Built-in Statistics

Access stats via bot messages or API:
```
/stats - Get bot statistics
/health - Health check
/config - View current configuration
```

### External Monitoring

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Datadog](https://www.datadoghq.com) for comprehensive monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Bot
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Add deployment steps for your platform
```

## 🛡️ Security Best Practices

1. **Environment Variables**
   - Never commit tokens to Git
   - Use platform secret management
   - Rotate tokens regularly

2. **Access Control**
   - Limit bot to specific chats if needed
   - Implement user allowlists for sensitive commands
   - Monitor usage patterns

3. **Rate Limiting**
   - Built-in cooldowns prevent spam
   - Monitor API usage
   - Implement circuit breakers for external APIs

## 🚀 Production Checklist

- [ ] Bot token configured
- [ ] Health check endpoint working
- [ ] All features tested
- [ ] Monitoring setup
- [ ] Error handling in place
- [ ] Rate limiting configured
- [ ] Security measures implemented
- [ ] Backup/recovery plan
- [ ] Documentation updated

## 📞 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review platform-specific documentation
3. Check the project's GitHub issues
4. Create a new issue with:
   - Platform used
   - Error messages
   - Configuration details
   - Steps to reproduce

---

**Happy Deploying! 🎉**

Your advanced Telegram bot with NLP, meme generation, and atmosphere enhancement is ready to make your chats more engaging and fun! 