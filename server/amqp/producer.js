// Access the callback-based API
const amqp = require('amqplib/callback_api');
// const userStore = require('../service/UserStore');
const File = require('../models/file');

// const fileController = require('../controllers/fileController'); // get user Controller
// const listEmail = fileController.getFileByNameAndEmail; // get list all email
// const listEmail = { 1: 'naegawolf09@gmail.com' };
const url = 'amqp://uyqjyxpa:Ea3VfOnGKPDSXGkS4PXd7QLaTNPSGlmU@cougar.rmq.cloudamqp.com/uyqjyxpa';
// let connected;
const exchange = 'server';
class Producer {
  constructor() {
    this.amqpConn = null;
    this.channel = null;
  }

  amqpStart() {
    // connect to amqp
    amqp.connect(url, (err, conn) => {
      if (err) {
        return setTimeout(() => console.error('[AMQP]', err.message), 1000);
      }
      conn.on('error', (err0) => {
        if (err0.message !== 'Connection closing') {
          console.error('[AMQP] conn error', err0.message);
        }
      });
      // conn.on('close', () => setTimeout(() => console.error('[AMQP] reconnecting'), 1000));
      console.log('[AMQP] connected');
      this.amqpConn = conn;

      // create channel named
      this.amqpConn.createChannel((err0, channel) => {
        if (this.closeOnErr(err0)) return;
        this.channel = channel;
        channel.on('error', (err1) => {
          console.error('[AMQP] channel error', err1.message);
        });
        // channel.on('close', () => {
        //   console.log('[AMQP] channel closed');
        // });

        // create exchange
        channel.assertExchange(exchange, 'direct', { // activeEmail = name of exchange
          durable: true,
        });

        channel.prefetch(10);
      });
    });
  }

  syncFile(ownerEmail, fileJSON) { // when add and update file
    // let res01 = File.find({owner: msg}).lean().exec((err, res) => {
    const result = JSON.stringify(fileJSON);
    const listEmailNeeded = fileJSON.user;
    listEmailNeeded.unshift(ownerEmail);
    console.log(listEmailNeeded);
    listEmailNeeded.forEach((email) => {
      this.channel.publish(exchange, email, Buffer.from(result));
      console.log(' [x] Sent %s:', email);
      console.log(result);
    });
  }

  syncDelFile(ownerEmail, fileJSON) {
    const result = JSON.stringify(fileJSON);
    // let listEmailNeeded = fileJSON.user;
    // listEmailNeeded.unshift(ownerEmail);
    // console.log(listEmailNeeded);
    // listEmailNeeded.forEach(email => {
    this.channel.publish(exchange, ownerEmail, Buffer.from(result));
    console.log(' [x] Sent %s:', email);
    console.log(result);
    // });
  }

  closeOnErr(err) {
    if (!err) return false;
    console.error('[AMQP] error', err);
    this.amqpConn.error();
    return true;
  }
}

const producer = new Producer();
module.exports = producer;
