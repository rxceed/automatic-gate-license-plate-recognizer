#include "esp_wifi.h"
#include "driver/gpio.h"
#include "driver/mcpwm_prelude.h"
#include "soc/io_mux_reg.h"
#include "freertos/FreeRTOS.h"
#include "nvs_flash.h"
#include "mqtt_client.h"
#include <stdio.h>
#include <string.h>

#define SSID "RXHSPT"
#define PASSWORD "yayayasayasetuju"
#define MQTT_BROKER "ws://emqx@10.113.198.207:8083/mqtt"
#define IR_PIN 4
#define SERVO_PIN 12

#define SERVO_PWM_TIMEBASE_RESOLUTION 1000000
#define SERVO_PWM_TIMEBASE 20000
#define SERVO_MAX_DEG 90
#define SERVO_MIN_DEG -90
#define SERVO_MAX_PULSEWIDTH 2400
#define SERVO_MIN_PULSEWIDTH 500

static char proximityDetect;
static char gateState;
static char isGateOpen = 0;

static esp_mqtt_client_handle_t mqttClient;

static inline uint32_t angleDegree(int degree)
{
    return (degree - SERVO_MIN_DEG)*(SERVO_MAX_PULSEWIDTH - SERVO_MIN_PULSEWIDTH)/(SERVO_MAX_DEG-SERVO_MIN_DEG)+SERVO_MIN_PULSEWIDTH;
}

static void mqttEventHandler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
    esp_mqtt_event_handle_t mqttEvent = event_data;
    esp_mqtt_client_handle_t mqttClient = mqttEvent->client;
    switch(event_id)
    {
        case MQTT_EVENT_CONNECTED:
            esp_mqtt_client_subscribe(mqttClient, "/gate/control", 2);
            //esp_mqtt_client_subscribe(mqttClient, "/vision/control", 2);
            printf("MQTT CONNECTED\n");
            printf("SUBSCRIBED TO TOPIC /gate/control\n");
            //printf("SUBSCRIBED TO TOPIC /vison/control\n");
            break;
        case MQTT_EVENT_DISCONNECTED:
            esp_mqtt_client_unsubscribe(mqttClient, "/gate/control");
            printf("MQTT DISCONNECTED, UNSUBSCRIBED TO TOPIC");
            break;
        case MQTT_EVENT_DATA:
            printf("data: %s\ntopic: %s\n", mqttEvent->data, mqttEvent->topic);
            if(strcmp(mqttEvent->topic, "/gate/control") == 0)
            {
                if(strcmp(mqttEvent->data, "OK") == 0 && gateState == 1)
                {
                    isGateOpen = 1;
                }
            }
            break;
        default:
            break;
    }
}

static void mqttInit()
{
    esp_mqtt_client_config_t mqttCfg = {
        .broker.address.uri = MQTT_BROKER
    };
    mqttClient = esp_mqtt_client_init(&mqttCfg);
    esp_mqtt_client_register_event(mqttClient, ESP_EVENT_ANY_ID, mqttEventHandler, NULL);
    esp_mqtt_client_start(mqttClient);
}

static void wifiEventHandler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
    switch(event_id)
    {
    case WIFI_EVENT_STA_START:
        printf("WIFI STA MODE START\n");
        break;
    case WIFI_EVENT_STA_CONNECTED:
        printf("WIFI CONNECTED: %s\n", SSID);
        break;
    case WIFI_EVENT_STA_DISCONNECTED:
        printf("Connecting....\n");
        esp_wifi_connect();
        break;
    case IP_EVENT_STA_GOT_IP:
        if(event_base == IP_EVENT)
        {
            ip_event_got_ip_t* ipEvent = event_data;
            printf("IP ADDRESS: %d.%d.%d.%d\n", IP2STR(&ipEvent->ip_info.ip));
            mqttInit();
            break;
        }
        else
        {
            break;
        }
    default:
        break;
    }
}

static void wifiInit()
{
    wifi_init_config_t initCfg = WIFI_INIT_CONFIG_DEFAULT();
    wifi_config_t wifiCfg = {
        .sta = {
            .ssid = SSID,
            .password = PASSWORD,
        }
    };
    esp_event_handler_instance_t instanceAnyWifi;
    esp_event_handler_instance_t instanceAnySTA;
    esp_netif_init();
    esp_event_loop_create_default();
    esp_netif_create_default_wifi_sta();
    esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifiEventHandler, NULL, &instanceAnyWifi);
    esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifiEventHandler, NULL, &instanceAnySTA);
    esp_wifi_init(&initCfg);
    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(WIFI_IF_STA, &wifiCfg);
    esp_wifi_start();
    esp_wifi_connect();
}

void mainTask()
{
    gpio_set_direction(IR_PIN, GPIO_MODE_INPUT);
    gpio_iomux_out(IR_PIN, FUNC_GPIO4_GPIO4, false);

    mcpwm_timer_config_t mcpwmTimerCfg = {
        .group_id = 0,
        .clk_src = MCPWM_TIMER_CLK_SRC_DEFAULT,
        .count_mode = MCPWM_TIMER_COUNT_MODE_UP,
        .resolution_hz = SERVO_PWM_TIMEBASE_RESOLUTION,
        .period_ticks = SERVO_PWM_TIMEBASE
    };
    mcpwm_timer_handle_t mcpwmTimer = NULL;
    
    mcpwm_operator_config_t mcpwmOperatorCfg = {
        .group_id = 0
    };
    mcpwm_oper_handle_t mcpwmOperator = NULL;
    
    mcpwm_generator_config_t mcpwmGeneratorCfg = {
        .gen_gpio_num = SERVO_PIN
    };
    mcpwm_gen_handle_t mcpwmGenerator = NULL;
    
    mcpwm_comparator_config_t mcpwmComparatorCfg = {
        .flags.update_cmp_on_tez = 1
    };
    mcpwm_cmpr_handle_t mcpwmComparator = NULL;

    mcpwm_new_timer(&mcpwmTimerCfg, &mcpwmTimer);
    mcpwm_new_operator(&mcpwmOperatorCfg, &mcpwmOperator);
    mcpwm_operator_connect_timer(mcpwmOperator, mcpwmTimer);

    mcpwm_new_generator(mcpwmOperator, &mcpwmGeneratorCfg, &mcpwmGenerator);
    mcpwm_new_comparator(mcpwmOperator, &mcpwmComparatorCfg, &mcpwmComparator);

    mcpwm_comparator_set_compare_value(mcpwmComparator, angleDegree(0));

    mcpwm_generator_set_action_on_timer_event(mcpwmGenerator, MCPWM_GEN_TIMER_EVENT_ACTION(MCPWM_TIMER_DIRECTION_UP, MCPWM_TIMER_EVENT_EMPTY, MCPWM_GEN_ACTION_HIGH));
    mcpwm_generator_set_action_on_compare_event(mcpwmGenerator, MCPWM_GEN_COMPARE_EVENT_ACTION(MCPWM_TIMER_DIRECTION_UP, mcpwmComparator, MCPWM_GEN_ACTION_LOW));
    mcpwm_timer_enable(mcpwmTimer);
    mcpwm_timer_start_stop(mcpwmTimer, MCPWM_TIMER_START_NO_STOP);
    
    //mcpwm_comparator_set_compare_value(mcpwmComparator, angleDegree(-90));
    while(1)
    {
        proximityDetect = gpio_get_level(IR_PIN);
        if(gateState == 0)
        {
            if(proximityDetect)
            {
                esp_mqtt_client_publish(mqttClient, "/vision/control", "START", 0, 2, 0);
                gateState++;
            }
        }
        else if(gateState == 1)
        {
            vTaskDelay(7000/portTICK_PERIOD_MS);
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
            mcpwm_comparator_set_compare_value(mcpwmComparator, angleDegree(90));
            vTaskDelay(5000/portTICK_PERIOD_MS);
            if(!proximityDetect)
            {
                gateState++;
            }
        }
        else if(gateState == 3)
        {
            vTaskDelay(5000/portTICK_PERIOD_MS);
            mcpwm_comparator_set_compare_value(mcpwmComparator, angleDegree(0));
            vTaskDelay(2000/portTICK_PERIOD_MS);
            isGateOpen = 0;
            gateState = 0;
        }
        printf("gateState: %d\n isGateOpen: %d\n", gateState, isGateOpen);
        vTaskDelay(10);
    }
}

void app_main() 
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) 
    {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifiInit();
    xTaskCreatePinnedToCore(mainTask, "Main Task", 4096, NULL, 1, NULL, 1);
}