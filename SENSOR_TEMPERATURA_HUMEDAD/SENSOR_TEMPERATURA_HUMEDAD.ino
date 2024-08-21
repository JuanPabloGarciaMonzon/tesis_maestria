//Libraries
#include <DHT22.h>

//Constants
#define pinDATA SDA    // what pin we're connected to
DHT22 dht22(pinDATA);

//Variables
//int chk;
int h;  //Stores humidity value
int t; //Stores temperature value

void setup()
{
    Serial.begin(9600); //1bit=10µs
}

void loop()
{
    //Read data and store it to variables h (humidity) and t (temperature)
    // Reading temperature or humidity takes about 250 milliseconds!
    h = dht22.getHumidity();
    t = dht22.getTemperature();

    if (dht22.getLastError() != dht22.OK) {
      Serial.print("last error :");
      Serial.println(dht22.getLastError());
    }
    
    //Print temp and humidity values to serial monitor
  Serial.print(h);
  Serial.print(",");
  Serial.println(t);
    
  delay(2500); //Delay 1 sec.
}