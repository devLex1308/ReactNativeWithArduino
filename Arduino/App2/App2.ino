String SET_SEGMENT_A = "300";
String SET_SEGMENT_B = "301";
String SET_SEGMENT_C = "302";
String SET_SEGMENT_D = "303";
String SET_SEGMENT_E = "304";
String SET_SEGMENT_F = "305";
String SET_SEGMENT_G = "306";

const int S_A = 2;
const int S_B = 3;
const int S_C = 4;
const int S_D = 5;
const int S_E = 6;
const int S_F = 7;
const int S_G = 8;

int a, b, c, d, e, f, g;

void setup()
{
  for (int i = 2; i < 9; i++) {
    pinMode(i, OUTPUT);
  }
  Serial.begin(9600);
  a = false;
  b = false;
  c = false;
  d = false;
  e = false;
  f = false;
  g = false;
}

String data = "";
char character;
int l;
void loop(){
  if (Serial.available()) {
      character = Serial.read();
      data = data + character;
      Serial.println(character);
      l = data.length();
      if (l > 2) {
        if (data == SET_SEGMENT_A) { a = !a; }
        if (data == SET_SEGMENT_B) { b = !b; }
        if (data == SET_SEGMENT_C) { c = !c; }
        if (data == SET_SEGMENT_D) { d = !d; }
        if (data == SET_SEGMENT_E) { e = !e; }
        if (data == SET_SEGMENT_F) { f = !f; }
        if (data == SET_SEGMENT_G) { g = !g; }

        Serial.println(data);
        Serial.println(l);
        data = "";
      }
  }

  digitalWrite(S_A, a ? HIGH : LOW);
  digitalWrite(S_B, b ? HIGH : LOW);
  digitalWrite(S_C, c ? HIGH : LOW);
  digitalWrite(S_D, d ? HIGH : LOW);
  digitalWrite(S_E, e ? HIGH : LOW);
  digitalWrite(S_F, f ? HIGH : LOW);
  digitalWrite(S_G, g ? HIGH : LOW);
}
