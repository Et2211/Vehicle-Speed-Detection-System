from imageai.Detection import ObjectDetection
import os
import cv2
import tensorflow
import sys

execution_path = sys.argv[1]
image = sys.argv[2]

#execution_path = 'G:/My Drive/Third year/Final year project/Dev/static/'
#image = 'imgs/test8.jpg'

#print("direct " + execution_path + image)

detector = ObjectDetection()
detector.setModelTypeAsRetinaNet()
detector.setModelPath( os.path.join(execution_path , "resnet50_coco_best_v2.0.1.h5"))
detector.loadModel()
detections = detector.detectObjectsFromImage(input_image=os.path.join(execution_path , image), output_image_path=os.path.join(execution_path , "imagenew.jpg"))

img = cv2.imread(execution_path + image,cv2.IMREAD_COLOR)

i=0

for eachObject in detections:
    if eachObject["name"] == 'car':
        offPage = False
        
        for j in range(4):
            if eachObject['box_points'][j] < 0:
                offPage = True

        if offPage == False:

            x1 = eachObject['box_points'][0] 
            y1 = eachObject['box_points'][1] 
            x2 = eachObject['box_points'][2] 
            y2 = eachObject['box_points'][3] 

            crop = img[y1: y2, x1: x2]
            cv2.imshow("results" + str(i), crop)
            i+=1
cv2.waitKey(0)
returnString = '{"source" : "' + execution_path + '" ,"img" : "imgs/cropped.png"}' 
print(returnString)