import pandas as pd
import numpy as np
import cv2
import glob
import imutils
from imutils import paths
import os
import os.path
import pickle
import urllib.request
import imutils
import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelBinarizer
from tensorflow.keras.models import Sequential, model_from_json
from http.server import HTTPServer, BaseHTTPRequestHandler
from http import HTTPStatus
import json
import cgi
import os
import glob
import numpy as np
import tensorflow.compat.v1 as tf # Ensure TF2 compatability
import keras
from keras.models import Model
from keras.layers import Dense, Input, concatenate, Conv2D, GaussianNoise
from keras.preprocessing.image import ImageDataGenerator
# from keras.optimizers import Adam
from tensorflow.keras.optimizers import Adam # - Works
import keras.backend as K
# from keras.utils import plot_model
from keras.utils.vis_utils import plot_model
from keras.callbacks import TensorBoard, ModelCheckpoint, Callback, ReduceLROnPlateau
from keras.models import load_model
# from keras.utils import multi_gpu_model
# from tensorflow.python.keras.utils.multi_gpu_utils import multi_gpu_model
from PIL import Image
import matplotlib.pyplot as plt
from random import randint
import imageio
from io import StringIO, BytesIO
import os
import numpy as np
import keras
import cv2
import math
import sys
from keras.models import Model
from keras.models import load_model
from PIL import Image
import argparse
from PIL import Image
import requests
from io import BytesIO
import matplotlib.image as mpimg
import boto3  # pip install boto3
import shutils


# Let's use Amazon S3
# from scipy.misc import imsave
# import imageio
# from skimage.util.shape import view_as_blocks
tf.disable_v2_behavior()

# train_y=[];
# with open ('outfile', 'rb') as fp:
#     train_y = pickle.load(fp)


# lb = LabelBinarizer().fit(train_y)

# json_file = open('model.json', 'r')
# loaded_model_json = json_file.read()
# json_file.close()
# loaded_model = model_from_json(loaded_model_json)
# loaded_model.load_weights("model.h5")



# def model(img):
#     url_response = urllib.request.urlopen(img)

#     img_array = np.array(bytearray(url_response.read()), dtype=np.uint8)
#     captcha_image = cv2.imdecode(img_array, -1)
#     gray = cv2.cvtColor(captcha_image, cv2.COLOR_BGR2GRAY)
    
#     thresh = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY_INV, cv2.THRESH_OTSU)[1]

#     letter_image_regions = []

#     contours, hierarchy = cv2.findContours(thresh.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)

#     avg_h=20

#     for contour in contours:
#         (x, y, w, h) = cv2.boundingRect(contour)

#         if (abs(h-avg_h)<5):
#             letter_image_regions.append((x, y, w, h))

#     letter_image_regions = sorted(letter_image_regions, key=lambda x: x[0])
#     counts={}
#     predictions = []

#     for letter_bounding_box in letter_image_regions:
#         x, y, w, h = letter_bounding_box
#         letter_image = gray[y:y+h, x:x+w]

#         letter_image = cv2.resize(letter_image, (30,30))
#         letter_image = np.expand_dims(letter_image, axis=2)
#         letter_image = np.expand_dims(letter_image, axis=0)

#         pred = loaded_model.predict(letter_image)
            
#         letter = lb.inverse_transform(pred)[0]
#         predictions.append(letter)

#         captcha_text = "".join(predictions)
#     return(captcha_text)

# Normalize inputs
def normalize_batch(imgs):
    '''Performs channel-wise z-score normalization'''

    return (imgs -  np.array([0.485, 0.456, 0.406])) /np.array([0.229, 0.224, 0.225])

# Denormalize outputs
def denormalize_batch(imgs,should_clip=True):
    imgs= (imgs * np.array([0.229, 0.224, 0.225])) + np.array([0.485, 0.456, 0.406])
    
    if should_clip:
        imgs= np.clip(imgs,0,1)
    return imgs




def hide(url):
    print(url)
    model='./hide.h5'
    model_hide=load_model(model,compile=False)
    response = requests.get(url)
    with open("secret.jpg", "wb") as f:
        f.write(response.content)
    # Normalize input images [float: 0-1]
    secretin = np.array(Image.open('./secret.jpg').convert('RGB')).reshape(1,224,224,3)/255.0
    coverin = np.array(Image.open('./cover.jpg').convert('RGB')).reshape(1,224,224,3)/255.0
    # Predict the output       
    coverout=model_hide.predict([normalize_batch(secretin),normalize_batch(coverin)])

    # Postprocess the output
    coverout = denormalize_batch(coverout)
    coverout=np.squeeze(coverout)*255.0
    coverout=np.uint8(coverout)

    # plot stego-image output (container image)
    imageio.imsave('./hidden.jpg',coverout)
    s3 = boto3.client("s3",aws_access_key_id='',aws_secret_access_key= '')

    with open('hidden.jpg', 'rb') as data:
        s3.upload_fileobj(data, 'be-project-2023','hidden_image.jpg')

def reveal(url):
    model = "./reveal.h5"


    response = requests.get(url)

    # Load the model
    model_reveal=load_model(model,compile=False)

    stego_image = np.array(Image.open(BytesIO(response.content)).convert('RGB')).reshape(1,224,224,3)/255.0

    # plt.imshow(stego_image)
    # plt.show()
    # Predict the output       
    secretout = model_reveal.predict([normalize_batch(stego_image)])

    # Postprocess the output
    secretout = denormalize_batch(secretout)
    secretout=np.squeeze(secretout)*255.0
    secretout=np.uint8(secretout)

    imageio.imsave('./revealed.jpg',secretout)
    s3 = boto3.client("s3",aws_access_key_id='AKIAVQTYULZTFHK3F3PA',aws_secret_access_key= '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')

    with open('revealed.jpg', 'rb') as data:
        s3.upload_fileobj(data, 'be-project-2023','revealed_image.jpg')



class Server(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.end_headers()
        
    def do_HEAD(self):
        self._set_headers()
        
    
    def do_GET(self):
        from ast import literal_eval
        self._set_headers()
        try:
            # captcha_text=model(body["img"])
            reveal("https://be-project-2023.s3.ap-south-1.amazonaws.com/hidden_image.jpg")
            response=json.dumps({'status':'success','url':"https://be-project-2023.s3.ap-south-1.amazonaws.com/revealed_image.jpg"})
        except:
            response=json.dumps({'status':'failure','url':"none"})
        response = bytes(response, 'utf-8')
        self.wfile.write(response)
        
    def do_POST(self):
        self._set_headers()
        # content_length = int(self.headers['Content-Length'])
        # post_data = self.rfile.read(content_length)
        # body=json.loads(post_data.decode('utf-8'))
        try:
            # captcha_text=model(body["img"])
            hide("https://be-project-2023.s3.ap-south-1.amazonaws.com/secret_image.jpg")
            response=json.dumps({'status':'success','url':"https://be-project-2023.s3.ap-south-1.amazonaws.com/hidden_image.jpg"})
        except:
            response=json.dumps({'status':'failure','url':"none"})
            
        response = bytes(response, 'utf-8')
        self.wfile.write(response)
        
def run(server_class=HTTPServer, handler_class=Server, port=8008):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    
    print('Starting httpd on port %d...' % port)
    httpd.serve_forever()
    
if __name__ == "__main__":
    from sys import argv
    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
    # hide('https://be-project-2023.s3.ap-south-1.amazonaws.com/secret_image.jpg')
