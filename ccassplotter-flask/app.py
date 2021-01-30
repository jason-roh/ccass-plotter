from flask import Flask
from flask_cors import CORS
from controllers import controller

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(controller.bp)
    return app

app = create_app()
