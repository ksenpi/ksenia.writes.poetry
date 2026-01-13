# GitHub Pages Deployment

Your poetry website is now ready to be deployed to GitHub Pages!

## Deployment Steps

1. **Push your code to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: https://github.com/ksenpi/ksenia.writes.poetry
   - Click on **Settings** (in the repository menu)
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Wait for deployment**:
   - GitHub Pages will build and deploy your site
   - This usually takes 1-2 minutes
   - You'll see a green checkmark when it's ready

4. **Access your site**:
   - Your site will be available at: `https://ksenpi.github.io/ksenia.writes.poetry/`
   - GitHub will show you the URL in the Pages settings

## Updating Your Site

Whenever you make changes:
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. GitHub Pages will automatically rebuild and deploy your changes (usually within 1-2 minutes)

## Notes

- GitHub Pages serves static files, so your site will work perfectly
- The poems will load from the `poems/` directory
- Make sure all poem files are committed and pushed to GitHub
- If you add new poems, remember to:
  1. Add the filename to the `poemFiles` array in `script.js`
  2. Commit and push the changes

