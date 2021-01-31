# CCASS PLOTTER

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
