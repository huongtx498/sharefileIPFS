const os = require('os');
const path = require('path');

module.exports = {
  defaultDir: path.join(os.userInfo().homedir, 'ipfsbox'),
  saveZipFolder: path.join(os.userInfo().homedir, '.config', 'client'),
  ipfsPeers: ['/ip6/2604:a880:2:d1::a6:f001/tcp/4001/ipfs/QmUancR3ci1dtPZehjAEbrhXe28LdpAc55RPFcdRtX6J6c',
    '/ip4/63.33.193.178/tcp/4001/ipfs/QmUwT16Tnv5bn3uuXHm2kjL3e18ZUapuGKiTvCTbxsFPzF',
    '/ip4/157.245.176.193/tcp/4001/ipfs/QmUancR3ci1dtPZehjAEbrhXe28LdpAc55RPFcdRtX6J6c',
    '/ip4/95.217.9.218/tcp/4001/ipfs/QmcaNjSEf4P7acrRHeMPB3RF2Yr18TG1pmWZKqzPyQrG2v',
    '/ip6/2a01:4f9:c010:5a1a::1/tcp/4001/ipfs/QmcaNjSEf4P7acrRHeMPB3RF2Yr18TG1pmWZKqzPyQrG2v',
    '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
    '/ip4/78.46.133.230/tcp/4001/ipfs/QmUmsP8m74cwHJupVi3tWccx7iXvur1bnKw24sGWLstWDg',
    '/ip6/2a01:4f8:c17:2e6::1/tcp/4001/ipfs/QmUmsP8m74cwHJupVi3tWccx7iXvur1bnKw24sGWLstWDg',
  ],
};
