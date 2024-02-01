####유량계 값 발생 (임의값) 

https://github.com/anotherph/nCube-Thyme_Flowmeter.git 설치
cd nCube-Thyme_Flowmeter/tas_Flowmeter/ 
node test_mqtt.js

새로운 터미널에 
cd nCube-Thyme_Flowmeter/tas_Flowmeter/ 
node tas_Flowmeter.js  (유량계 임의값 발생)

#### 유량계데이터 → Mobius
새로운 터미널에 
cd nCube-Thyme_Flowmeter/
node thyme.js

#### Mobius → datacore
https://github.com/anotherph/datahub_fl.git 설치
cd datahub_fl
node datahub.js


