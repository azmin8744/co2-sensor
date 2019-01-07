#!/usr/bin/python3

import signal
import time
import os
from datetime import datetime as dt
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from lib import sensor
from google.api_core import exceptions

cred = credentials.Certificate(os.path.dirname(__file__) + '/secret.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def post_concentration(*args):
  result = sensor.read()
  timestamp = dt.now()
  doc_ref = db.collection('concentration').document(str(int(timestamp.timestamp())))
  while True:
    try:
      doc_ref.set({
        'concentration': result['concentration'],
        'timestamp': firestore.SERVER_TIMESTAMP
      })
      break
    except exceptions.ServerError as err:
      print('A server error has occured. detail: ', err)
      print('Retry sending 10 seconds later.')
      time.sleep(10)
      pass
    

signal.signal(signal.SIGALRM, post_concentration)
signal.setitimer(signal.ITIMER_REAL, 0.1, 60)

while True:
  time.sleep(1)
