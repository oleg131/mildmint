# Netlify Deployment Guide

This guide will help you deploy Mildmint to Netlify with MongoDB Atlas backend.

## Prerequisites

1. A [Netlify](https://www.netlify.com/) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
3. Git installed on your computer

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster (M0 tier is sufficient)
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Save the username and password
4. Whitelist all IPs:
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Netlify Functions
5. Get your connection string:
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with your database name (e.g., `todos`)

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.abcdef.mongodb.net/todos?retryWrites=true&w=majority
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify UI

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to your Git provider and select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variable:
   - Go to Site settings → Environment variables
   - Click "Add a variable"
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string (from Step 1)
7. Click "Deploy site"

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize Netlify in your project:
   ```bash
   netlify init
   ```

4. Set environment variable:
   ```bash
   netlify env:set MONGODB_URI "your-mongodb-connection-string"
   ```

5. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Step 3: Test Your Deployment

1. Visit your Netlify URL (e.g., `https://your-app.netlify.app`)
2. Create a new list by clicking "+ New List"
3. Add some todos
4. Refresh the page - your todos should persist (stored in MongoDB)

## Using Local Storage Mode

If you want to use localStorage instead of MongoDB, add `?local=true` to the URL:
```
https://your-app.netlify.app/your-list-id?local=true
```

This is useful for:
- Testing without MongoDB
- Offline usage
- Privacy (data stays in browser)

## Troubleshooting

### Function errors

Check Netlify function logs:
1. Go to your site in Netlify
2. Click "Functions" tab
3. Click on the `list` function
4. View logs at the bottom

### MongoDB connection issues

- Verify your connection string is correct
- Ensure you've whitelisted 0.0.0.0/0 in Network Access
- Check that your database user has read/write permissions

### Environment variables not loading

- Ensure `MONGODB_URI` is set in Netlify's environment variables
- Redeploy after setting environment variables
- Check for typos in the variable name

## Project Structure

```
todo/
├── netlify/
│   └── functions/
│       ├── db.js           # MongoDB connection & schema
│       └── list.js         # API endpoint for lists
├── src/
│   ├── components/
│   ├── hooks/
│   │   └── useTodos.js     # Handles both localStorage & API
│   └── ...
├── netlify.toml            # Netlify configuration
├── .env.example            # Environment variables template
└── package.json
```

## API Endpoints

Once deployed, your app will have these API endpoints:

- `GET /.netlify/functions/list/:listId` - Get a todo list
- `PUT /.netlify/functions/list/:listId` - Update a todo list

## Local Development with MongoDB

If you want to test MongoDB locally:

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add your MongoDB URI to `.env`:
   ```
   MONGODB_URI=mongodb+srv://...
   ```

3. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

4. Run dev server with functions:
   ```bash
   netlify dev
   ```

This will start both Vite dev server and Netlify Functions locally.

## Cost

- **MongoDB Atlas M0 (Free tier)**: Free forever, 512 MB storage
- **Netlify Free tier**:
  - 100 GB bandwidth/month
  - 125,000 function invocations/month
  - More than enough for personal use!

Both services are free for small to medium usage.
