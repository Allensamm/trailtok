# GitHub Repository Creation Script
# Run this to create the repo first, then push

echo 🚀 Creating GitHub Repository...
echo.

# Create repository using GitHub API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{
    "name": "movie-discovery-app",
    "description": "Complete movie discovery app with social features, React Native frontend, Node.js backend, ready for production deployment",
    "private": false,
    "auto_init": false
  }'

echo Repository created! Now pushing code...
git push -u origin master

echo ✅ Code pushed to GitHub!
echo 🔗 Repository: https://github.com/Allensamm/movie-discovery-app