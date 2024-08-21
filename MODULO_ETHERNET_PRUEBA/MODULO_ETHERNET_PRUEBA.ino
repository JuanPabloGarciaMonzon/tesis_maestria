//Incluimos las librerias necesarias para el servidor web
#include <SPI.h>
#include <Ethernet.h>
#include <DHT.h> //Introduzco la libreria necesaria para el sensor DHT22
#include <Wire.h>

//Declara constantes y pin de entrada
#define DHTPIN A0 //Indicamos el pin donde conectaremos la patilla data de nuestro sensor.

// Definimos el tipo de sensor que vas a emplear. En este caso usamos el DHT22
#define DHTTYPE DHT22   // DHT 22  (AM2302)

DHT dht(DHTPIN, DHTTYPE);  //Indica el pin con el que trabajamos y el tipo de sensor

// Se introducen la ip y la mac.
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192,168,10,130);

// Inicializa la libreria ethernet, el puerto 80 esta por defecto para HTTP
EthernetServer server(81); //Abrir el puerto 125 en tu router si quieres poder verlo fuera de la red local.

void setup()/////////////////////////////////////////////////////////////////////////////////////////////////
{
  // Abrir comunicacion serial y esperar que el puerto responda
  Serial.begin(9600);
  dht.begin();
  while (!Serial) {
    ; // Esperar a que el puerto serial se conecte (solo cuando usamos Arduino Leonardo)
  }
  //Inicializar la conexion Ethernet y el servidor
  Ethernet.begin(mac, ip);
  server.begin();
  Serial.print("server is at ");
  Serial.println(Ethernet.localIP());
} 
void loop()/////////////////////////////////////////////////////////////////////////////////////////////////
{
  //Escucha a clientes de entrada
  EthernetClient client = server.available();
  if (client) {
    Serial.println("new client");
    //Una solicitud http cuya linea esta en blanco
    boolean currentLineIsBlank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        Serial.write(c);
        // Si la linea en la solicitud http esta en blanco y el cliente esta disponible se puede enviar una respuesta
        if (c == '\n' && currentLineIsBlank) {
          float h = dht.readHumidity();  //Guarda la lectura de la humedad en la variable float h
          float t = dht.readTemperature();  //Guarda la lectura de la temperatura en la variable float t
          // Crear el JSON con los datos
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: application/json");
          client.println("Connnection: close");
          client.println();
          client.print("{\"temperature\":");
          client.print(t, 1);
          client.print(", \"humidity\":");
          client.print(h, 0);
          client.println("}");
          break;
        }
        if (c == '\n') {
          //Linea en blanco
          currentLineIsBlank = true;
        } 
        else if (c != '\r') {
          //Si hay un caracter en la linea en blanco
          currentLineIsBlank = false;
        }
      }
    }
    //Darle al navegador web tiempo para recibir los datos 
    delay(1000); //Tiene un retardo de 1000 ms = 1s para repetir el ciclo void loop.
    //Se cierra la conexion
    client.stop();
    Serial.println("client disonnected");
  }
} //Termina loop
