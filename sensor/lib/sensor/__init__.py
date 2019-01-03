# http://eleparts.co.kr/data/design/product_file/SENSOR/gas/MH-Z19_CO2%20Manual%20V2.pdf
import serial
import time

def read():
  ser = serial.Serial('/dev/ttyS0',
                      baudrate=9600,
                      bytesize=serial.EIGHTBITS,
                      parity=serial.PARITY_NONE,
                      stopbits=serial.STOPBITS_ONE,
                      timeout=1.0)
  while 1:
    result=ser.write(0xff0186000000000079.to_bytes(9, 'big'))
    s=ser.read(9)
    if s[0] == 0xff and s[1] == 0x86:
      return {'concentration': s[2]*256 + s[3]}

if __name__ == '__main__':
  value = read()
  print("co2=", value["co2"])
