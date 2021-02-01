# CCASS PLOTTER

## Set up 
### Flask set-up
1. Go to ccassplotter-flask folder
2. Create a new python virtual environment
```
python3 -m venv “env name”
```
3. Install flask and other modules needed
```
ccassplotter-flask/requirements.txt
```
4. Start flask with Port 8080

### React set-up
1. Go to ccassplotter-web folder
2. Install nodejs modules
```
npm install
```
3. react-spring patch due to known issue with Gatsby
https://github.com/pmndrs/react-spring/issues/1078
```
npm run react-spring-issue-1078
```
4. Start react-app
```
npm run start:local-mac
```

## Deploy to AWS
plesase refer to https://adamraudonis.medium.com/how-to-deploy-a-website-on-aws-with-docker-flask-react-from-scratch-d0845ebd9da4
### Deploy React to AWS S3
1. Go to ccassplotter-web folder
2. Change S3 url on deploy.sh
3. Run deploy.sh
```
source deploy.sh
```

### Deploy Flask to AWS ECR
1. Go to ccassplotter-flask folder
2. Change ECR url on deploy.sh
3. Run deploy.sh
```
source deploy.sh
```

### Invalidate Files on CloudFront
1. Run command below
```
aws cloudfront create-invalidation --distribution-id your-dist-id --paths "/*"
```
