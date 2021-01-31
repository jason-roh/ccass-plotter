echo "Deploying Frontend..."
export REACT_APP_CCASS_PLOT_FLASK_BASK_URL=/api
npm run build
aws s3 sync build/ s3://ccassplotter-web --acl public-read
