from darkflow.net.build import TFNet
import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import cv2
import imutils
import os
dirname = os.path.dirname(__file__)

options = {"pbLoad": dirname + "/yolo-plate.pb", "metaLoad": "yolo-plate.meta", "gpu": 0.9}
yoloPlate = TFNet(options)

options = {"pbLoad": "yolo-character.pb", "metaLoad": "yolo-character.meta", "gpu":0.9}
yoloCharacter = TFNet(options)

characterRecognition = tf.keras.models.load_model('character_recognition.h5')

def firstCrop(img, predictions):
    predictions.sort(key=lambda x: x.get('confidence'))
    xtop = predictions[-1].get('topleft').get('x')
    ytop = predictions[-1].get('topleft').get('y')
    xbottom = predictions[-1].get('bottomright').get('x')
    ybottom = predictions[-1].get('bottomright').get('y')
    firstCrop = img[ytop:ybottom, xtop:xbottom]
    cv2.rectangle(img,(xtop,ytop),(xbottom,ybottom),(0,255,0),3)
    return firstCrop
    
def secondCrop(img):
    gray=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    ret,thresh = cv2.threshold(gray,127,255,0)
    contours,_ = cv2.findContours(thresh,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
    areas = [cv2.contourArea(c) for c in contours]
    if(len(areas)!=0):
        max_index = np.argmax(areas)
        cnt=contours[max_index]
        x,y,w,h = cv2.boundingRect(cnt)
        cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)
        secondCrop = img[y:y+h,x:x+w]
    else: 
        secondCrop = img  
    return secondCrop

#cap = cv2.VideoCapture('testVid1.mp4') //Use for saved videos
cap = cv2.VideoCapture(0)
counter=0
plateNum=0
while(cap.isOpened()):
    ret, frame = cap.read()
    if ret:
        h, w, l = frame.shape
        #frame = imutils.rotate(frame, 20)
        cv2.imshow('frame',frame)
        if counter%15 == 0:       
            try:
                predictions = yoloPlate.return_predict(frame)
                firstCropImg = firstCrop(frame, predictions)
                secondCropImg = secondCrop(firstCropImg)
                cv2.imshow('Second crop plate',secondCropImg)    
                
                if not(os.path.exists(dirname + '/results')) :         
                    os.mkdir(dirname + '/results')      
                        
                cv2.imwrite(dirname + '/results/result' + str(plateNum) + '.jpg', secondCropImg)
                plateNum+=1
            except:
                pass
                #print("no plate in frame")                
        counter+=1

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    else: 
        cap.release()
        cv2.destroyAllWindows()

