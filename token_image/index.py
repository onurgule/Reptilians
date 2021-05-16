import os
import sys
from flask import Flask, send_file, redirect, make_response, Response
import requests
import json
import base64
from PIL import Image
from io import BytesIO, StringIO
import werkzeug
from tempfile import NamedTemporaryFile
from shutil import copyfileobj
from os import remove

sys.path.insert(0, os.path.dirname(__file__))
application = Flask(__name__)

PEOPLE_FOLDER = os.path.join('img')

def add_border(pil_img,level):
    img1 = pil_img
    imgborder=Image.open("toptanpng/"+str(level)+".png")
    img1.paste(imgborder, (0, 0), imgborder)
    return img1

def serve_pil_image(pil_img):
    img_io = BytesIO()
    pil_img.save(img_io, 'JPEG', quality=70)
    img_io.seek(0)
    return send_file(img_io, mimetype='image/jpeg')

@application.route('/')
def index():
    return PEOPLE_FOLDER
@application.route('/<tid>')
def inspect(tid):
    return redirect('/inspect.php?id='+tid);
@application.route("/img/<check>")
def get_image(check):
    return send_file(
        "/img/"+check+'.jpeg',
        mimetype='image/jpg',
        cache_timeout=0
    )
@application.route("/original/<txid>.png")
def tx_image_original(txid):
    headers = {'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}
    r = requests.get("IMAGEURL", headers=headers)
    details = r.json()
    pil_img = Image.open("/img/"+details['checksum']+'.jpeg')
    pil_img = add_border(pil_img,details['level'])
    pil_img = pil_img.resize((512,512))
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    return Response(buffer.getvalue(), mimetype='image/png')
@application.route("/32/<txid>.png")
def tx_image_32(txid):
    headers = {'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}
    r = requests.get("IMAGEURL", headers=headers)
    details = r.json()
    pil_img = Image.open("/img/"+details['checksum']+'.jpeg')
    pil_img = add_border(pil_img,details['level'])
    pil_img = pil_img.resize((32,32))
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    return Response(buffer.getvalue(), mimetype='image/png')
@application.route("/64/<txid>.png")
def tx_image_64(txid):
    headers = {'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}
    r = requests.get("IMAGEURL", headers=headers)
    details = r.json()
    pil_img = Image.open("/img/"+details['checksum']+'.jpeg')
    pil_img = add_border(pil_img,details['level'])
    pil_img = pil_img.resize((64,64))
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    return Response(buffer.getvalue(), mimetype='image/png')
@application.route("/128/<txid>.png")
def tx_image_128(txid):
    headers = {'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}
    r = requests.get("IMAGEURL", headers=headers)
    details = r.json()
    pil_img = Image.open("/img/"+details['checksum']+'.jpeg')
    pil_img = add_border(pil_img,details['level'])
    pil_img = pil_img.resize((128,128))
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    return Response(buffer.getvalue(), mimetype='image/png')
    
    
