
interface IIPCMessage { }

interface IIPCProcess<TMESSAGE extends IIPCMessage>  {
  post(msg: TMESSAGE): void;
}
