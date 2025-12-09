#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include "secret.hpp"

// ---------- WIFI CONFIG ----------
#define WIFI_SSID       ENV_SSID
#define WIFI_PASSWORD   ENV_WIFI_PASSWORD

// ---------- MQTT CONFIG ----------
#define MQTT_BROKER     ENV_MQTT_BROKER
#define MQTT_PORT       ENV_MQTT_PORT
#define MQTT_CLIENT_ID  "ESP32_Gate"
#define MQTT_TOPIC_SUB  "esp32/gate/control"
#define MQTT_TOPIC_PUB  "esp32/vision/control"

//PIN
#define IR_PIN 4
#define SERVO_PIN 12
#define TRIG_PIN 16
#define ECHO_PIN 17

//Global vars
static char proximityDetect;
static char gateState;
static char isGateOpen = 0;

WiFiClient espClient;
PubSubClient client(espClient);
Servo gateServo;

// ---------- MQTT CALLBACK ----------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on ");
  Serial.print(topic);
  Serial.print(": ");

  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  if(!strcmp(topic, MQTT_TOPIC_SUB) && !message.compareTo("OK"))
  {
    isGateOpen = 1;
    String msg = "STOP";
    client.publish(MQTT_TOPIC_PUB, msg.c_str());
    Serial.println("Published: " + msg);

  }
}

// ---------- WIFI CONNECT ----------
void connectWiFi() {
  Serial.print("Connecting to WiFi ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// ---------- MQTT CONNECT ----------
void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT... ");

    if (client.connect(MQTT_CLIENT_ID)) {
      Serial.println("connected!");

      // Subscribe after connect
      client.subscribe(MQTT_TOPIC_SUB);
      Serial.print("Subscribed to: ");
      Serial.println(MQTT_TOPIC_SUB);

    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 3 seconds...");
      delay(3000);
    }
  }
}

//Main task
void gateTask(void *parameters)
{
  unsigned long duration;
  float distance = 0;
  float threshold = 40;
  while(1)
  {
    digitalWrite(TRIG_PIN, 0);
    vTaskDelay(pdMS_TO_TICKS(5));
    digitalWrite(TRIG_PIN, 1);
    vTaskDelay(pdMS_TO_TICKS(10));
    digitalWrite(TRIG_PIN, 0);
    duration = pulseIn(ECHO_PIN, 1);
    distance = (duration)/58.0;
    vTaskDelay(10);

    if(distance <= threshold)
    {
      proximityDetect = 1;
    }
    else
    {
      proximityDetect = 0;
    }
    if(gateState == 0)
    {
      if(proximityDetect)
      {
        String msg = "START";
        client.publish(MQTT_TOPIC_PUB, msg.c_str());
        Serial.println("Published: " + msg);
        gateState++;
      }
    }
    else if(gateState == 1)
    {
      vTaskDelay(pdMS_TO_TICKS(1000));
      if(isGateOpen)
      {
        gateState++;
      }
      else
      {
        gateState = 0;
      }
    }
    else if(gateState == 2)
    {
      gateServo.write(90);
      vTaskDelay(pdMS_TO_TICKS(1000));
      if(!proximityDetect)
      {
        gateState++;
      }
    }
    else if(gateState == 3)
    {
      vTaskDelay(pdMS_TO_TICKS(500));
      gateServo.write(0);
      vTaskDelay(pdMS_TO_TICKS(500));
      isGateOpen = 0;
      gateState = 0;
    }
    Serial.printf("prximity: %d distance: %.2f gate_state: %d \n", proximityDetect, distance, gateState);
    vTaskDelay(10);
  }
}

// ---------- SETUP ----------
void setup() {
  Serial.begin(115200);
  pinMode(IR_PIN, INPUT);
  pinMode(SERVO_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  gateServo.attach(SERVO_PIN);
  gateServo.write(0);

  connectWiFi();

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);

  xTaskCreatePinnedToCore(gateTask, "gate_task", 4096, NULL, 1, NULL, 1);
}

// ---------- LOOP ----------
void loop() {
  if (!client.connected()) {
    connectMQTT();
  }

  client.loop();
}
