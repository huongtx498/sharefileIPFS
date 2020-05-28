// Access the callback-based API
const amqp = require('amqplib/callback_api');
const os = require('os');
const path = require('path');
const userStore = require('../service/UserStore');
const FileUtils = require('../common/FileUtils');
const FileStore = require('../service/FileStore');
const properties = require('../common/properties');

const activeEmail = userStore.getActiveUser();
const url = 'amqp://uyqjyxpa:Ea3VfOnGKPDSXGkS4PXd7QLaTNPSGlmU@cougar.rmq.cloudamqp.com/uyqjyxpa';
const exchange = 'server';

class Consumer {
  constructor() {
    this.amqpConn = null;
    this.ch = null;
    this.queue = null;
  }

  amqpStart() {
    amqp.connect(url, (err, conn) => {
      if (err) {
        return setTimeout(() => console.error('[AMQP]', err.message), 1000);
      }
      conn.on('error', (err0) => {
        if (err0.message !== 'Connection closing') {
          console.error('[AMQP] conn error');
          console.error(err0.message);
        }
      });
      conn.on('close', () => setTimeout(() => console.error('[AMQP] reconnecting'), 1000));
      console.log('[AMQP] connected');
      this.amqpConn = conn;

      this.amqpConn.createChannel((err0, channel) => {
        if (this.closeOnErr(err0)) return;
        this.ch = channel;
        channel.on('error', (err1) => {
          console.error('[AMQP] channel error', err1.message);
        });
        channel.on('close', () => {
          console.log('[AMQP] channel closed');
        });

        channel.assertExchange('server', 'direct', { // activeEmail = name of exchange
          durable: true,
        });

        channel.prefetch(10);
        // create queue with random name
        channel.assertQueue(`${os.hostname()}-${activeEmail}`, {
          // exclusive: true,
          durable: true,
        }, (error2, q) => {
          if (error2) {
            throw error2;
          }
          this.queue = q.queue;
          console.log(' [*] Waiting for logs. To exit press CTRL+C');
          // bind that queue and exchange with bindingKey = routingKey = activeEmail
          channel.bindQueue(q.queue, exchange, activeEmail);

          // received a msg
          channel.consume(q.queue, async (msg) => { // do something with msg
            const syncFile = JSON.parse(msg.content.toString());
            if (syncFile.isDeleted === false) { // if is has isDeleted => add/update 
                FileStore.addFileSync(syncFile);
              const downloadDir = path.join(properties.defaultDir, activeEmail);
              const mapFileVer = {
                name: syncFile.name,
                cid: syncFile.version[(syncFile.version).length - 1].cid,
                hash_key: syncFile.hash_key,
                version: syncFile.version,
              };
              console.log('Map file ver in consume: ', mapFileVer);
              FileUtils.getFileFromIPFS(mapFileVer, mapFileVer.name, downloadDir);
            } else if (syncFile.hasOwnProperty(user)){ // else if it has user => share file
              const mapFileVer = {
                name: syncFile.name,
                cid: syncFile.version[(syncFile.version).length - 1].cid,
                hash_key: syncFile.hash_key,
                version: syncFile.version,
              };
                FileStore.shareFile(mapFileVer, syncFile.user, syncFile.owner)
            } else {
              FileStore.deleteFile(syncFile.name, syncFile.owner);
            } // else delete file
            
          }, {
            noAck: true,
          });
        });
      });
    });
  }

  closeOnErr(err) {
    if (!err) return false;
    console.error('[AMQP] error', err);
    this.amqpConn.error();
    return true;
  }
}

const consumer = new Consumer();
module.exports = consumer;
