import os
import cv2
import numpy as np
from random import randint

opencv_home = cv2.__file__
folders = opencv_home.split(os.path.sep)[0:-1]
path = folders[0]
for folder in folders[1:]:
    path = path + "/" + folder
face_detector_path = path+"/data/haarcascade_frontalface_default.xml"
print("haar cascade configuration found here: ",face_detector_path)
if os.path.isfile(face_detector_path) != True:
    raise ValueError("Confirm that opencv is installed on your environment! Expected path ",face_detector_path," violated.")
haar_detector = cv2.CascadeClassifier(face_detector_path)
def detect_faces(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = haar_detector.detectMultiScale(gray, 1.3, 5)
    return faces
age_model = cv2.dnn.readNetFromCaffe("age_deploy.prototxt", "age_net.caffemodel")
gender_model = cv2.dnn.readNetFromCaffe("gender_deploy.prototxt", "gender_net.caffemodel")
output_indexes = np.array([i for i in range(0, 101)])
def recognize_gender_and_age(filename):
    model_mean_values = (78.4263377603, 87.7689143744, 114.895847746)
    age_list = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']
    gender_list = [1, 0]

    age_net = cv2.dnn.readNet("age_net.caffemodel", "age_deploy.prototxt")
    gender_net = cv2.dnn.readNet("gender_net.caffemodel", "gender_deploy.prototxt")

    cap = cv2.VideoCapture(filename)

    _, frame = cap.read()

    blob = cv2.dnn.blobFromImage(frame, 1.0, (227, 227), model_mean_values, swapRB=False)
    gender_net.setInput(blob)
    gender_predictions = gender_net.forward()
    gender = gender_list[gender_predictions[0].argmax()]

    age_net.setInput(blob)
    age_predictions = age_net.forward()
    age = age_list[age_predictions[0].argmax()]

    age = age[1:-1].split("-")

    print({'age':round(randint(int(age[0]),int(age[1]))),'gender':gender})
    print( {'age':int(age[0]), 'age2':int(age[1]), 'gender': gender})


