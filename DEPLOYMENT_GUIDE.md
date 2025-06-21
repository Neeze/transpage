# Deploying Azure AI Document Intelligence Clone to Netlify

This guide will walk you through deploying your Next.js Azure AI Document Intelligence clone application to Netlify.

## Project Overview

This is a **Next.js 15** application built with:
- **React 19** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Headless UI** for accessible components
- Comprehensive scroll animations and interactive features

## Prerequisites

Before you begin, make sure you have:
- A GitHub, GitLab, or Bitbucket account with your project repository
- A Netlify account (free tier available at [netlify.com](https://netlify.com))
- Your project code pushed to a Git repository

## Quick Start

1. **Build & Test Locally:**
   ```bash
   cd fe
   npm install
   npm run build
   npm start
   ```

2. **Deploy to Netlify:**
   - Connect your Git repository to Netlify
   - Use the pre-configured `netlify.toml` file (already included)
   - Build command: `cd fe && npm ci && npm run build`
   - Publish directory: `fe/.next`

## Project Structure

Your project should have this structure:
```
transpage/
├── netlify.toml        # Netlify configuration (pre-configured)
├── fe/                 # Frontend Next.js application
│   ├── src/
│   │   ├── app/        # Next.js App Router pages
│   │   ├── components/ # React components with animations
│   │   └── hooks/      # Custom React hooks (including scroll animations)
│   ├── public/
│   │   └── images/     # Static assets and images
│   ├── package.json
│   ├── next.config.ts  # Next.js configuration (Netlify-optimized)
│   └── tailwind.config.js
├── be/                 # Backend (if applicable)
├── config/
└── services/
```

## Key Features Included

✅ **Scroll Animations** - Smooth fade-in effects for sections  
✅ **Interactive Demos** - Tabbed interfaces and document upload  
✅ **Responsive Design** - Mobile-first TailwindCSS styling  
✅ **Performance Optimized** - Image optimization and lazy loading  
✅ **Accessibility** - ARIA labels and keyboard navigation  
✅ **Azure/Fluent Design** - Microsoft design system colors and typography

## Step 1: Prepare Your Next.js Application ✅ 

**Good news!** Your application is already configured for Netlify deployment:

### 1.1 Next.js Configuration ✅ DONE

The `next.config.ts` is already optimized for Netlify:

```typescript
// Image optimization for Netlify
images: {
  unoptimized: true,
},
```

### 1.2 Netlify Configuration ✅ DONE

The `netlify.toml` file is already created in your project root with optimal settings:

```toml
[build]
  command = "cd fe && npm ci && npm run build"
  publish = "fe/.next"
  base = "."

[build.environment]
  NODE_VERSION = "18"
```

### 1.3 Package.json Scripts ✅ DONE

Ensure your `fe/package.json` has the correct build scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next export"
  }
}
```

## Step 2: Deploy via Git Integration (Recommended)

### 2.1 Push Code to Repository

1. Ensure all your code is committed and pushed to your Git repository:
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2.2 Connect Repository to Netlify

1. Log in to your [Netlify account](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your project repository

### 2.3 Configure Build Settings

Your project is pre-configured with optimal build settings. Use these values:

1. **Base directory**: `.` (root - this is correct)
2. **Build command**: `cd fe && npm ci && npm run build`
3. **Publish directory**: `fe/.next`
4. **Node.js version**: `18` (set in netlify.toml)
5. Click "Deploy site"

The deployment should work automatically with these settings!

## Step 3: Deploy via Netlify CLI (Alternative)

### 3.1 Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 3.2 Login to Netlify

```bash
netlify login
```

### 3.3 Initialize and Deploy

```bash
# Navigate to your project root
cd transpage

# Initialize Netlify site
netlify init

# Build the project
cd fe && npm run build && cd ..

# Deploy to production
netlify deploy --prod --dir=fe/.next
```

## Step 4: Environment Variables (If Needed)

If your application uses environment variables:

### 4.1 Via Netlify Dashboard

1. Go to your site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add your variables:
   - `NEXT_PUBLIC_API_URL`
   - `DATABASE_URL`
   - etc.

### 4.2 Via Netlify CLI

```bash
netlify env:set NEXT_PUBLIC_API_URL "https://your-api-url.com"
```

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In your site dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain name
4. Follow the DNS configuration instructions

### 5.2 Enable HTTPS

Netlify automatically provides free HTTPS certificates via Let's Encrypt.

## Step 6: Optimization for Production

### 6.1 Enable Build Optimization

Add these optimizations to your `netlify.toml`:

```toml
[build]
  command = "cd fe && npm ci && npm run build"
  
[build.processing]
  skip_processing = false
  
[build.processing.css]
  bundle = true
  minify = true
  
[build.processing.js]
  bundle = true
  minify = true
  
[build.processing.html]
  pretty_urls = true
```

### 6.2 Configure Caching

```toml
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

## Step 7: Monitoring and Analytics

### 7.1 Enable Analytics

1. Go to "Site settings" → "Analytics"
2. Enable Netlify Analytics for traffic insights

### 7.2 Set Up Build Notifications

1. Go to "Site settings" → "Build & deploy" → "Deploy notifications"
2. Add email or Slack notifications for build status

## Troubleshooting

### Common Issues

1. **Build Fails**: Check build logs in Netlify dashboard
2. **404 Errors**: Ensure redirect rules are configured correctly
3. **Environment Variables**: Prefix client-side variables with `NEXT_PUBLIC_`
4. **Image Loading Issues**: Set `images.unoptimized = true` in `next.config.ts`

### Build Command Issues

If the build fails, try these alternative commands:

```bash
# Option 1: Explicit path
cd fe && npm install && npm run build

# Option 2: Using yarn
cd fe && yarn install && yarn build

# Option 3: Force clean install
cd fe && rm -rf node_modules package-lock.json && npm install && npm run build
```

### Next.js App Router Specific

For App Router applications, ensure:
- Publish directory is `fe/.next`
- Redirect rules are properly configured
- Dynamic routes have proper `generateStaticParams` if using static export

## Continuous Deployment

Once set up, Netlify will automatically:
- Build and deploy when you push to your connected branch
- Preview deploy branches and pull requests
- Rollback to previous deployments if needed

## Performance Tips

1. **Optimize Images**: Use Next.js Image component with proper sizing
2. **Code Splitting**: Leverage Next.js automatic code splitting
3. **Bundle Analysis**: Use `@next/bundle-analyzer` to analyze bundle size
4. **CDN**: Netlify automatically serves assets via global CDN

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Headers**: Configure security headers in `netlify.toml`
3. **HTTPS**: Always use HTTPS in production (enabled by default)
4. **Access Control**: Use Netlify Identity or third-party auth if needed

## Cost Optimization

- **Free Tier**: 100GB bandwidth, 300 build minutes/month
- **Build Minutes**: Optimize build time by caching dependencies
- **Bandwidth**: Optimize images and assets for smaller file sizes

## Support and Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Netlify Community](https://community.netlify.com/)
- [Netlify Status](https://netlifystatus.com/)

---

Your Azure AI Document Intelligence clone should now be successfully deployed to Netlify! 🚀
