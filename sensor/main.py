import signal
import time
from datetime import datetime as dt
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from lib import sensor


cred = credentials.Certificate('./secret.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def post_concentration(*args):
  result = sensor.read()
  print(result)
  timestamp = dt.now()
  doc_ref = db.collection('concentration').document(str(int(timestamp.timestamp())))
  doc_ref.set({
    'concentration': result['concentration'],
    'timestamp': dt.now().isoformat()
  })

signal.signal(signal.SIGALRM, post_concentration)
signal.setitimer(signal.ITIMER_REAL, 0.1, 60)

while True:
  time.sleep(1)
