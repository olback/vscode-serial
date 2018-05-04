/*
 *  Test code  
 */

void setup()
{
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop()
{
    if (Serial.available() > 0)
    {
        String str = Serial.readString();
        digitalWrite(LED_BUILTIN, HIGH);
        // Serial.print("Response: ");
        Serial.println(str);
        digitalWrite(LED_BUILTIN, LOW);
    }
}
