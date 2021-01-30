echo "Deploying Backend..."
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 277622302018.dkr.ecr.us-east-2.amazonaws.com
docker build -t ccassplotter-flask .
docker tag ccassplotter-flask:latest 277622302018.dkr.ecr.us-east-2.amazonaws.com/ccassplotter-flask:latest
docker push 277622302018.dkr.ecr.us-east-2.amazonaws.com/ccassplotter-flask:latest
cd aws_deploy
eb deploy
