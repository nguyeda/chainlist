rsync -r src/ docs/
rsync build/contracts/ChainList.json docs/
git add .
git commit -m "sync frontend page to github pages"
git push origin master
