

export interface IMessage {
    timestamp:number,
    role:string,
    content:string,
    files:File[]
}


export interface IChat{
    owner:string,
    timestamp:number,
    date:string,
    messages:IMessage[],
    model:string,
    contextHorizont:number,
    temperatur:number,
    inputTokens:number,
    outputTokens:number,
    totalCosts:number,
    web:boolean,
    rag:boolean,
    tool:boolean
}

export const initialChat:Partial<IChat> = {
    owner:'',
    messages:[],
    contextHorizont:4,
    temperatur:0.2,
    inputTokens:0,
    outputTokens:0,
    totalCosts:0,
    web:false,
    rag:false,
    tool:false 
}