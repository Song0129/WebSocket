b="dev"
br=`git branch | grep "*"`
branch=${br/* /}
if [ "$b" != "$branch" ]
then
echo "当前分支不正确！！！"
else
git pull origin dev
git add .
git commit -m 'dev'
git push origin dev

fi
