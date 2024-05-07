const fs = require('fs');
const { get } = require('http');
const mqtt = require('mqtt');
const axios = require('axios');


// conf
const config = require('./conf.js');
const connectUrl = `mqtt://${config.cse.host}:${config.cse.mqttport}`
const mobiusTopicConf = {
  flowmeter: '/oneM2M/req/Mobius2/Mobius/KETI_Flowmeter/flowmeter/json'
};
const entityCreateRequestBodyTemplate = (() => {
  console.log('Loading template string of request body for creating waterflow entity')
  const templateFileName = "flowmeter-entity-template.json";

  // Reading JSON from a file
  const waterFlowRequestBody = JSON.parse(fs.readFileSync(templateFileName, 'utf8'));

  // Converting JSON object to string
  let templateString = JSON.stringify(waterFlowRequestBody);
  templateString = JSON.parse(templateString);

  console.log('Template string: ', templateString);
  return templateString;
})();

const client = mqtt.connect(connectUrl);

client.on('message', (topic, message) => {
  const configureHttpRequest = (parentResourceName, resourceName) => {
    return {
      method: 'get',
      maxBodyLength: Infinity,
      url: `http://${config.cse.host}:${config.cse.port}${parentResourceName}/${resourceName}/la`,
      headers: {
        'Accept': 'application/json',
        'X-M2M-RI': '12345',
        'X-M2M-Origin': 'SKETI_Flowmeter'
      }
    };
  };

  const postData = (cinResponse) => {
    const apiURL = `http://${config.datacore.host}:${config.datacore.port}/entityOperations/upsert`;
    const requestHeaders = {
      'Content-Type': 'application/json'
    };

    const requestBody = ((cinResponse) => {
      const responseBodyJsonString = JSON.stringify(cinResponse.data);

      console.log(`Response string: `, responseBodyJsonString);

      const cinObject = JSON.parse(responseBodyJsonString);

      // set entity
      let mFlowrate = cinObject["m2m:cin"]["con"]["m_flowrate"];
      let matches = mFlowrate.match(/\d+\.\d+/);
      mFlowrate = matches && matches[0];

      let mSpeed = cinObject["m2m:cin"]["con"]["m_speed"];
      matches = mSpeed.match(/\d+\.\d+/);
      mSpeed = matches && matches[0];

      let tflowrate = cinObject["m2m:cin"]["con"]["t_flowrate"];
      matches = tflowrate.match(/\d+\.\d+/);
      tflowrate = matches && matches[0];

      let curTime = cinObject["m2m:cin"]["con"]["cur_time"];
      curTime = '20' + curTime.replace(/\s/g, 'T') + 'Z';

      // set json file
      entityCreateRequestBodyTemplate['entities'][0]['flowRate']['value'] = mFlowrate
      entityCreateRequestBodyTemplate['entities'][0]['flowRate']['observedAt'] = curTime
      entityCreateRequestBodyTemplate['entities'][0]['velocity']['value'] = mSpeed
      entityCreateRequestBodyTemplate['entities'][0]['velocity']['observedAt'] = curTime
      entityCreateRequestBodyTemplate['entities'][0]['cumulativeFlow']['value'] = tflowrate
      entityCreateRequestBodyTemplate['entities'][0]['cumulativeFlow']['observedAt'] = curTime

      return {
        ...entityCreateRequestBodyTemplate,
        entities: [
          {
            ...entityCreateRequestBodyTemplate.entities[0],
            flowRate: {
              ...entityCreateRequestBodyTemplate.entities[0].flowRate,
              value: parseFloat(mFlowrate),
              observedAt: curTime,
            },
            velocity: {
              ...entityCreateRequestBodyTemplate.entities[0].velocity,
              value: parseFloat(mSpeed),
              observedAt: curTime,
            },
            cumulativeFlow: {
              ...entityCreateRequestBodyTemplate.entities[0].cumulativeFlow,
              value: parseFloat(tflowrate),
              observedAt: curTime,
            },
          },
        ],
      }
    })(cinResponse);

    console.log(`Request body to create flowmeter entity`, JSON.stringify(requestBody));

    axios.post(apiURL, requestBody, { headers: requestHeaders })
      .then(response => console.log(`Received response from datahub (datamodel: flowmeter, response_code: ${response.status})`))
      .catch(error => console.error(`Error occurred to create flowmeter entity`, error));
  }

  // Check if the subscribed topic is received
  if (mobiusTopicConf.flowmeter.indexOf(topic) >= 0) {
    console.log(`message received from ${topic}`);

    const requestConfig = configureHttpRequest(config.cnt[0].parent, config.cnt[0].name);

    axios.request(requestConfig)
      .then((response) => postData(response))
      .catch((error) => console.error(`Error occurred to get latest cin resource (${requestConfig.url})`, error));
  }
});

client.on('connect', () => {
  // Perform any setup logic here
  console.log(`Connected to the MQTT broker (${config.cse.host}:${config.cse.mqttport})`);

  client.subscribe(mobiusTopicConf.flowmeter, (error) => {
    if(error) {
      console.error(`Error occurred to subscribe MQTT topic (${mobiusTopicConf.flowmeter})`, error);
      return;
    }

    console.log(`Subscribed to the MQTT topic ${mobiusTopicConf.flowmeter}`);
  });
});
