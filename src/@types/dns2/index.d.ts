declare module 'dns2' {
  import { Socket } from 'dgram';
  export type listener = (...args: any[]) => void;

  export interface Server {
    socket: Socket;
    on: (event: string | symbol, listener: listener) => void;
    listen: (port: number | string, callbak: listener) => void;
    send: (response: Packet) => void;
  }

  interface PacketType {
    A:     number;
    NS:    number;
    MD:    number;
    MF:    number;
    CNAME: number;
    SOA:   number;
    MB:    number;
    MG:    number;
    MR:    number;
    NULL:  number;
    WKS:   number;
    PTR:   number;
    HINFO: number;
    MINFO: number;
    MX:    number;
    TXT:   number;
    AAAA:  number;
    SPF:   number;
    AXFR:  number;
    MAILB: number;
    MAILA: number;
    ANY:   number;
  }

  interface PacketClass {
    IN:  number;
    CS:  number;
    CH:  number;
    HS:  number;
    ANY: number;
  }

  export interface PacketQuestion {
    name: string;
  }

  export class Packet {
    static TYPE: PacketType;
    static CLASS: PacketClass;
    readonly questions: PacketQuestion[];
    readonly answers: object[];
    readonly header: { [key: string]: number }

    constructor(request: Packet);
  }


  export function createServer(options?: {}, listener?: listener): Server;
}
