#!/usr/bin/env node
'use strict';

const yaml = require('js-yaml');
const fs = require('fs');

//get prize_pool yaml file and generate block of code for email

try {
  const prizepools = yaml.safeLoad(fs.readFileSync(`${process.cwd()}/toys/prizepools.yml`, 'utf8'));
  getPrizes(prizepools['PrizePools']);
} catch (e) {
  console.error('something is wrong', e)
}

function getPrizes(prizepools) {
  let currentPrize = [];
  for (let prizepool of prizepools) {
    let tempArray = prizepool['prizes'].map( (prize, index) =>  {
      return {
        uuid: prize.uuid,
        simpleUuid: prize.uuid.replace(/-/g, '').toLowerCase(),
        desc: prize.descr,
        over_600: (Number(prize.arv) >= 600) ? 1 : 0,
        is_digital: prize.digital ? 1 : 0
      }
    });
    currentPrize = currentPrize.concat(tempArray);
  }
  createEmailPrizeFile(currentPrize);
}

function createEmailPrizeFile(prizes) {
  let fileString = ['<%\n']
  prizes.forEach(function (el, i, arr) {
  let currentPrize = `
  ${(i === 0) ? 'IF' : 'ELSIF'} prize_no_underscores == '${el.simpleUuid}';
  prize_name_header = '${el.desc}';
  prize_name_display = '${el.desc}';
  over_600 = ${el.over_600};\
  ${(el.over_600 === 1) ? '\n  declaration = \'%%ADD NAME%%\';' : ''}
  ${(el.is_digital === 1) ? 'is_digital = 1;\n' : ''}`;
  fileString.push(currentPrize);
  });
  fileString.push('END;\n%>');
  let filepath = `${process.cwd()}/templates/email/_prizes.tt2`;

  fs.writeFile(filepath, fileString.join(''), function error(err) {
    if (err) {
      return console.log('There was a critical FileSystem error.', err);
    }
  });
}


