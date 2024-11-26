import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { Network } from "../types/network";

const DIR_BASE = path.join(__dirname, "datos");
const DIR_NETWORKS = path.join(DIR_BASE, "networks");

export const createGenesis = (network: {
  id: any;
  chainId: string;
  alloc: string[];
}) => {
  const pathNetwork = path.join(DIR_NETWORKS, network.id);
  let genesis = {
    config: {
      chainId: parseInt(network.chainId),
      homesteadBlock: 0,
      eip150Block: 0,
      eip155Block: 0,
      eip158Block: 0,
      byzantiumBlock: 0,
      constantinopleBlock: 0,
      petersburgBlock: 0,
      istanbulBlock: 0,
      clique: {
        period: 4,
        epoch: 30000,
      },
    },
    nonce: "0x0",
    timestamp: "0x5e9d4d7c",
    extradata:
      "0x00000000000000000000000000000000000000000000000000000000000000002235dea2f59600419e3e894d4f2092f0f9c4bb620000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    gasLimit: "0x2fefd8",
    difficulty: "0x1",
    alloc: {
      "2235dea2f59600419e3e894d4f2092f0f9c4bb62": {
        balance: "0xad78ebc5ac6200000",
      },
      C077193960479a5e769f27B1ce41469C89Bec299: {
        balance: "0xad78ebc5ac6200000",
      },
    },
  };

  network.alloc.push(
    fs.readFileSync(`${pathNetwork}/address.txt`).toString().trim()
  );
  const additionalAlloc = network.alloc.reduce(
    (acc: { [x: string]: { balance: string } }, address: string) => {
      const cuenta =
        address.substring(0, 2) === "0x" ? address.substring(2) : address;
      acc[cuenta] = { balance: "0xad78ebc5ac6200000" };
      return acc;
    },
    {}
  );

  genesis.alloc = { ...genesis.alloc, ...additionalAlloc };

  let cuenta = fs.readFileSync(`${pathNetwork}/address.txt`).toString();
  cuenta = cuenta.substring(0, 2) === "0x" ? cuenta.substring(2) : cuenta;

  genesis.extradata = "0x" + "0".repeat(64) + cuenta.trim() + "0".repeat(130);
  return genesis;
};

export const createPassword = (network: Network) => "12345678";

export const createCuentaBootnode = (network: Network, pathNetwork: string) => {
  const cmd = `
    docker run -e IP="@172.16.238.20:0?discport=30301" \
    --rm -v ${pathNetwork}:/root ethereum/client-go:alltools-latest-arm64 \
    sh -c "geth account new --password /root/password.txt --datadir /root | grep 'of the key' | cut -c30-  \
    > /root/address.txt  \
    &&  bootnode -genkey /root/bootnode.key -writeaddress > /root/bootnode"`;

  execSync(cmd);
};

export const createDockerCompose = (network: { nodos: any[] }) => {
  const dockerCompose = `
version: '3'
services:
${createBootnode(network)}
${network.nodos
  .map((nodo: { type: any; name: any; ip: any; port: any }) => createNodo(nodo))
  .join("\n")}
networks:
ethnetwork:
  driver: bridge
  ipam:
    driver: default
    config:
      - subnet: \${SUBNET}
`;
  return dockerCompose;
};

export const createEnv = (network: {
  id: any;
  ipBootnode: any;
  subnet: any;
}) => {
  const pathNetwork = path.join(DIR_NETWORKS, network.id);
  let bootnode = `enode://${fs
    .readFileSync(`${pathNetwork}/bootnode`)
    .toString()}@${network.ipBootnode}:0?discport=30301`;
  bootnode = bootnode.replace("\n", "");
  const file = `
BOOTNODE=${bootnode}
SUBNET=${network.subnet}
IPBOOTNODE=${network.ipBootnode}
ETHERBASE=${fs.readFileSync(`${pathNetwork}/address.txt`).toString().trim()}
UNLOCK=${fs.readFileSync(`${pathNetwork}/address.txt`).toString().trim()}
`;
  return file;
};

const createBootnode = (network: any) => {
  const bootnode = `
  geth-bootnode:
      hostname: geth-bootnode
      image: ethereum/client-go:alltools-v1.11.5
      command: 'bootnode     --addr \${IPBOOTNODE}:30301 
          --netrestrict=\${SUBNET} 
          --nodekey=/pepe/bootnode.key'
      volumes:
      - ./bootnode.key:/pepe/bootnode.key
      networks:
          ethnetwork:
              ipv4_address: \${IPBOOTNODE} `;
  return bootnode;
};

const createNodo = (nodo: { type: any; name: any; ip: any; port: any }) => {
  switch (nodo.type) {
    case "miner":
      return createNodoMiner(nodo);
    case "rpc":
      return createNodoRpc(nodo);
    case "normal":
      return createNodoNormal(nodo);
  }
};

const createNodoMiner = (nodo: { name: any; ip: any }) => {
  const miner = `
  ${nodo.name}:
      image: ethereum/client-go:v1.11.5
      volumes:
          - ./${nodo.name}:/root/.ethereum
          - ./genesis.json:/root/genesis.json
          - ./password.txt:/root/.ethereum/password.sec
          - ./keystore:/root/.ethereum/keystore
      depends_on:
          - geth-bootnode
      networks:
          ethnetwork:
              ipv4_address: ${nodo.ip}
      entrypoint: sh -c 'geth init 
          /root/genesis.json && geth   
          --nat "extip:${nodo.ip}"
          --netrestrict=\${SUBNET} 
          --bootnodes="\${BOOTNODE}"
          --miner.etherbase \${ETHERBASE}   
          --mine  
          --unlock \${UNLOCK}
          --password /root/.ethereum/password.sec'
  `;
  return miner;
};

const createNodoRpc = (nodo: { name: any; ip: any; port: any }) => {
  const rpc = `
  ${nodo.name}:
      image: ethereum/client-go:v1.11.5
      volumes:
          - ./${nodo.name}:/root/.ethereum
          - ./genesis.json:/root/genesis.json
      depends_on:
           - geth-bootnode
      networks:
          ethnetwork:
                  ipv4_address: ${nodo.ip}
      ports:
          - "${nodo.port}:8545"
      entrypoint: sh -c 'geth init 
          /root/genesis.json && geth     
          --netrestrict=\${SUBNET}    
          --bootnodes="\${BOOTNODE}"
          --nat "extip:${nodo.ip}"
          --http 
          --http.addr "0.0.0.0" 
          --http.port 8545
          --http.corsdomain "*" 
          --http.api "admin,eth,debug,miner,net,txpool,personal,web3"'
  `;
  return rpc;
};

const createNodoNormal = (nodo: { name: any; ip: any }) => {
  const normalNode = `
  ${nodo.name}:
      image: ethereum/client-go:v1.11.5
      volumes:
          - ./${nodo.name}:/root/.ethereum
          - ./genesis.json:/root/genesis.json
      depends_on:
          - geth-bootnode
      networks:
          ethnetwork:
                  ipv4_address: ${nodo.ip}
      entrypoint: sh -c 'geth init 
          /root/genesis.json && geth   
          --bootnodes="\${BOOTNODE}"
          --nat "extip:${nodo.ip}"
          --netrestrict=\${SUBNET}  ' 
  `;
  return normalNode;
};
