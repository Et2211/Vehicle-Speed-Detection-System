from darkflow.net.build import TFNet
import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import cv2
import imutils
import os
import sys
import datetime
datetime.datetime.now()
dirname = sys.argv[1]

options = {"pbLoad": "yolo-plate.pb", "metaLoad": "yolo-plate.meta", "cpu": 1.0}
yoloPlate = TFNet(options)

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

cap1 = cv2.VideoCapture(0)
cap2 = cv2.VideoCapture(1)

#cap1 = cv2.VideoCapture(0)
#cap2 = cv2.VideoCapture(1)
counter=0
plateNum=0

while(cap1.isOpened()):
    ret, frame = cap1.read()
    ret2, frame2 = cap2.read()
    if ret:
        #h, w, l = frame.shape
        #frame = imutils.rotate(frame, 20)
        framed = cv2.resize(frame, (500, 500))
        framed2 = cv2.resize(frame2, (500, 500))
        cv2.imshow('frame',framed)
        cv2.imshow('frame2',framed2)

        if counter%15 == 0:       
            try:
                predictions = yoloPlate.return_predict(frame)
                firstCropImg = firstCrop(frame, predictions)
                secondCropImg = secondCrop(firstCropImg)
                cv2.imshow('Second crop plate',secondCropImg)   
                secondCropImg = cv2.cvtColor(secondCropImg, cv2.COLOR_BGR2GRAY) 
                
                if not(os.path.exists(dirname + '/results')) : 
                    os.mkdir(dirname + '/results')      
                        
                cv2.imwrite(dirname + '/results/result' + str(plateNum) + '.jpg', secondCropImg)
                rtnJSON = ('{"source": "./results/result' + str(plateNum) + '.jpg", "camera": "1" , "time": "' + str(datetime.datetime.now()) + '"}')
                print(rtnJSON)
                plateNum+=1
            except:
                pass
                #no plate in frame             
        
            try:
                predictions = yoloPlate.return_predict(frame2)
                firstCropImg = firstCrop(frame2, predictions)
                secondCropImg = secondCrop(firstCropImg)
                cv2.imshow('Second crop plate',secondCropImg)   
                secondCropImg = cv2.cvtColor(secondCropImg, cv2.COLOR_BGR2GRAY) 
                
                if not(os.path.exists(dirname + '/results')) :         
                    os.mkdir(dirname + '/results')      
                        
                cv2.imwrite(dirname + '/results/result' + str(plateNum) + '.jpg', secondCropImg)
                rtnJSON =('{"source": "./results/result' + str(plateNum) + '.jpg", "camera": "2" , "time": "' + str(datetime.datetime.now()) + '"}')
                print(rtnJSON)
                plateNum+=1
            except:
                pass
                #no plate in frame
        
        counter+=1

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    

   
    

