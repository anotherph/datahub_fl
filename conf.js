/**
 * Created by Il Yeup, Ahn in KETI on 2017-02-23.
 */

/**
 * Copyright (c) 2018, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const ip = require("ip");
const { nanoid } = require("nanoid");

let datacore ={};
let conf = {};
let cse = {};
let ae = {};
let cnt_arr = [];

datacore = { // ingest interface
    host    : '172.20.0.168',
    port    : '8081',
};

// build cse
cse = {
    // host    : 'keti.iotocean.org',
    host    : '172.20.0.109',
    port    : '7579',
    name    : 'Mobius',
    id      : '/Mobius2',
    mqttport: '1883',
    wsport  : '7577',
};

// build ae
let ae_name = 'KETI_Flowmeter';

ae = {
    name    : ae_name,
    id      : 'S' + ae_name,
    parent  : '/' + cse.name,
    appid   : 'measure_co2',
    port    : '9727',
    bodytype: 'json',
    tasport : '3105',
};

// build cnt
cnt_arr = [
    {
        parent: '/' + cse.name + '/' + ae.name,
        name: 'flowmeter',
    }
];

conf.cse = cse;
conf.datacore = datacore;
conf.ae = ae;
conf.cnt = cnt_arr;

module.exports = conf;
